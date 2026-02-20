import express from 'express';
import ExamQuestion from '../models/ExamQuestion.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Recruitment from '../models/Recruitment.js';
import ExamAllowlist from '../models/ExamAllowlist.js';
import SystemConfig from '../models/SystemConfig.js';
import auth from '../middleware/auth.js';
import { generateExamQuestions } from '../lib/groq.js';
import mongoose from 'mongoose';

const router = express.Router();

// ===== EXAM CONFIG (Settings) =====

// GET /api/exam/config — public/admin: get exam window
router.get('/config', async (req, res) => {
    try {
        const startTime = await SystemConfig.findOne({ key: 'exam_start' });
        const endTime = await SystemConfig.findOne({ key: 'exam_end' });
        res.json({
            startTime: startTime?.value,
            endTime: endTime?.value
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/exam/config — admin: set exam window
router.post('/config', auth, async (req, res) => {
    try {
        const { startTime, endTime } = req.body;
        if (startTime) await SystemConfig.findOneAndUpdate({ key: 'exam_start' }, { value: startTime }, { upsert: true });
        if (endTime) await SystemConfig.findOneAndUpdate({ key: 'exam_end' }, { value: endTime }, { upsert: true });
        res.json({ message: 'Exam configuration updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== EXAM QUESTIONS (Admin) =====

// POST /api/exam/questions — admin: add question
router.post('/questions', auth, async (req, res) => {
  try {
    const question = new ExamQuestion(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/exam/questions/bulk — admin: bulk add questions
router.post('/questions/bulk', auth, async (req, res) => {
  try {
    const questions = await ExamQuestion.insertMany(req.body.questions);
    res.status(201).json({ message: `${questions.length} questions added`, questions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/exam/questions/generate — admin: generate with AI
router.post('/questions/generate', auth, async (req, res) => {
    try {
        const { topic, count = 10 } = req.body;
        if (!process.env.GROQ_API_KEY) return res.status(400).json({ error: 'Groq API Key missing' });
        
        const aiQuestions = await generateExamQuestions(topic || 'General Technical Aptitude', count);
        
        // Save to DB
        const savedQuestions = await ExamQuestion.insertMany(aiQuestions.map(q => ({
            question: q.question,
            options: q.options,
            type: q.type || 'mcq',
            correctAnswer: q.correctAnswer,
            isActive: true
        })));
        
        res.json({ message: `Generated ${savedQuestions.length} questions`, questions: savedQuestions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/exam/questions/all — admin: all questions with answers
router.get('/questions/all', auth, async (req, res) => {
  try {
    const questions = await ExamQuestion.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/exam/questions/:id — admin: update question
router.put('/questions/:id', auth, async (req, res) => {
  try {
    const question = await ExamQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/exam/questions/:id — admin: delete question
router.delete('/questions/:id', auth, async (req, res) => {
  try {
    await ExamQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== EXAM TAKING (Public) =====

// POST /api/exam/start — student: start exam
router.post('/start', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user applied for recruitment or is in allowlist
    let candidate = await Recruitment.findOne({ email: normalizedEmail });
    if (!candidate) candidate = await ExamAllowlist.findOne({ email: normalizedEmail });

    if (!candidate) {
        return res.status(403).json({ error: 'You are not registered for the exam.' });
    }

    const { name, rollNo } = candidate;

    // Check if already submitted
    const existing = await ExamSubmission.findOne({ email: normalizedEmail });
    if (existing && existing.status !== 'in-progress') {
      return res.status(400).json({ error: 'You have already submitted the exam.' });
    }

    // Distribution: 5 Easy, 8 Medium, 7 Hard (Total 20)
    const easyQ = await ExamQuestion.find({ difficulty: 'easy', isActive: true }).lean();
    const medQ = await ExamQuestion.find({ difficulty: 'medium', isActive: true }).lean();
    const hardQ = await ExamQuestion.find({ difficulty: 'hard', isActive: true }).lean();

    if (easyQ.length < 5 || medQ.length < 8 || hardQ.length < 7) {
        return res.status(500).json({ error: 'Insufficient questions in bank. Please contact admin.' });
    }

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    const pickedEasy = shuffle(easyQ).slice(0, 5);
    const pickedMed = shuffle(medQ).slice(0, 8);
    const pickedHard = shuffle(hardQ).slice(0, 7);

    let finalQuestions = shuffle([...pickedEasy, ...pickedMed, ...pickedHard]);

    // Anti-Neighbor: Shuffle options within each question
    finalQuestions = finalQuestions.map(q => {
        const originalOptionsWithIndex = q.options.map((opt, i) => ({ opt, i }));
        const shuffled = shuffle([...originalOptionsWithIndex]);
        
        // Find where the correct answer index moved to
        const newCorrectIdx = shuffled.findIndex(s => s.i === q.correctAnswer);
        
        return {
            ...q,
            options: shuffled.map(s => s.opt),
            correctAnswer: newCorrectIdx // Save this for grading
        };
    });

    // Create or Resume submission
    let submission = existing;
    if (!submission) {
        submission = new ExamSubmission({
            name, 
            email: normalizedEmail, 
            rollNo: rollNo || 'N/A',
            startedAt: new Date(),
            totalQuestions: finalQuestions.length,
            questionSnapshot: finalQuestions 
        });
        await submission.save();
    }

    // Client-safe questions (ID, Text, Options only)
    const clientQuestions = finalQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        type: 'mcq'
    }));

    res.json({
        submissionId: submission._id,
        questions: clientQuestions,
        startedAt: submission.startedAt,
        timeLimit: 30, // 30 Minutes
        candidateName: name
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/exam/submit — student: submit answers
router.post('/submit', async (req, res) => {
  try {
    const { submissionId, answers } = req.body;
    
    const submission = await ExamSubmission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.status !== 'in-progress') {
      return res.status(400).json({ error: 'Exam already submitted' });
    }

    // Grade answers using the saved snapshot
    let score = 0;
    const snapshot = submission.questionSnapshot || []; // Fallback for old exams?
    
    if (snapshot.length > 0) {
        // We have a unique paper saved
        snapshot.forEach(q => {
            const userAnswer = answers.find(a => a.questionId === q._id.toString())?.selectedAnswer;
            
            if (q.type === 'mcq') {
                 if (userAnswer === q.correctAnswer) score++;
            } else {
                // Input type: simple rough check or manual grading required
                // For now, exact match string (case-insensitive)
                if (String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
                    score++;
                }
            }
        });
    } else {
        // Fallback to global DB questions (Legacy support)
        const questions = await ExamQuestion.find({ isActive: true });
        const questionMap = {};
        questions.forEach(q => { questionMap[q._id.toString()] = q.correctAnswer; });
        answers.forEach(a => {
            // Only grading MCQs here safely
            if (questionMap[a.questionId] === a.selectedAnswer) score++;
        });
    }

    submission.answers = answers;
    submission.score = score;
    submission.submittedAt = new Date();
    submission.status = req.body.autoSubmit ? 'auto-submitted' : 'submitted';
    await submission.save();

    res.json({ score, total: submission.totalQuestions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/exam/violation — student: log violation
router.post('/violation', async (req, res) => {
  try {
    const { submissionId, type } = req.body;
    const submission = await ExamSubmission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Not found' });

    submission.violations += 1;
    submission.violationLog.push({ type, timestamp: new Date() });
    await submission.save();

    res.json({ violations: submission.violations });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/exam/active — admin: live monitoring
router.get('/active', auth, async (req, res) => {
  try {
    const active = await ExamSubmission.find({ status: 'in-progress' })
      .select('name email rollNo startedAt violations violationLog adminWarnings score')
      .sort({ startedAt: -1 });
    res.json(active);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam/warning — admin: send warning to student
router.post('/warning', auth, async (req, res) => {
  try {
    const { submissionId, message } = req.body;
    const submission = await ExamSubmission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.adminWarnings.push({ message, timestamp: new Date() });
    await submission.save();

    res.json({ message: 'Warning sent', warnings: submission.adminWarnings });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/exam/status/:submissionId — student: poll for warnings/status
router.get('/status/:submissionId', async (req, res) => {
    try {
        const submission = await ExamSubmission.findById(req.params.submissionId).select('status adminWarnings extraMinutes');
        if (!submission) return res.status(404).json({ error: 'Not found' });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== ALLOWLIST MANAGEMENT =====

// POST /api/exam/allowlist — admin: add user to allowlist
router.post('/allowlist', auth, async (req, res) => {
    try {
        const entry = new ExamAllowlist(req.body);
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/exam/allowlist — admin: get allowlist
router.get('/allowlist', auth, async (req, res) => {
    try {
        const list = await ExamAllowlist.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/exam/submissions — admin: all submissions
router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await ExamSubmission.find().sort({ score: -1, submittedAt: 1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam/add-time — admin: grant extra time
router.post('/add-time', auth, async (req, res) => {
    try {
        const { submissionId, minutes } = req.body;
        const submission = await ExamSubmission.findByIdAndUpdate(
            submissionId, 
            { $inc: { extraMinutes: Number(minutes) } },
            { new: true }
        );
        res.json({ message: `Added ${minutes} minutes. Total extra: ${submission.extraMinutes}`, extraMinutes: submission.extraMinutes });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/exam/add-time-all — admin: grant extra time to all active
router.post('/add-time-all', auth, async (req, res) => {
    try {
        const { minutes } = req.body;
        const result = await ExamSubmission.updateMany(
            { status: 'in-progress' },
            { $inc: { extraMinutes: Number(minutes) } }
        );
        res.json({ message: `Added ${minutes} minutes to ${result.modifiedCount} active sessions.` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/exam/force-submit — admin: Forcefully submit a student's exam
router.post('/force-submit', auth, async (req, res) => {
  try {
    const { submissionId } = req.body;
    const submission = await ExamSubmission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.status !== 'in-progress') return res.status(400).json({ error: 'Exam already submitted' });

    // Grade current answers
    let score = 0;
    const snapshot = submission.questionSnapshot || [];
    const answers = submission.answers || [];

    snapshot.forEach(q => {
        const userAnswer = answers.find(a => a.questionId.toString() === q._id.toString())?.selectedAnswer;
        if (q.type === 'mcq' && userAnswer === q.correctAnswer) {
            score++;
        } else if (q.type === 'input' && String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
            score++;
        }
    });

    submission.score = score;
    submission.totalQuestions = snapshot.length;
    submission.submittedAt = new Date();
    submission.status = 'auto-submitted'; // Marked as auto to differentiate
    await submission.save();

    res.json({ message: 'Exam forcefully submitted', score, total: snapshot.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam/update-answers — student: Periodic sync of answers
router.post('/update-answers', async (req, res) => {
  try {
    const { submissionId, answers } = req.body;
    await ExamSubmission.findByIdAndUpdate(submissionId, { answers });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam/questions/bulk — admin: bulk upload MCQ questions
router.post('/questions/bulk', auth, async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'Expected an array of questions' });

    const formatted = questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || 'medium',
      type: 'mcq',
      isActive: true
    }));

    await ExamQuestion.insertMany(formatted);
    res.json({ message: `Successfully imported ${formatted.length} questions.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/exam/export — admin: Export results to CSV
router.get('/export', auth, async (req, res) => {
  try {
    const submissions = await ExamSubmission.find().sort({ score: -1, submittedAt: 1 }).lean();
    
    // Create CSV Header
    let csv = 'Rank,Name,Email,Roll No,Score,Total,Status,Violations,Date,Time\n';
    
    submissions.forEach((s, i) => {
      const date = s.submittedAt ? new Date(s.submittedAt) : null;
      const dateStr = date ? date.toLocaleDateString() : 'N/A';
      const timeStr = date ? date.toLocaleTimeString() : 'N/A';
      csv += `${i + 1},"${s.name}","${s.email}","${s.rollNo}",${s.score},${s.totalQuestions},"${s.status}",${s.violations},"${dateStr}","${timeStr}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=recruitment_exam_results.csv');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/exam/reset-all — admin: Wipe all submissions
router.delete('/reset-all', auth, async (req, res) => {
  try {
    const resDelete = await ExamSubmission.deleteMany({});
    res.json({ message: `Deleted ${resDelete.deletedCount} submissions.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
