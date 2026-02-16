import express from 'express';
import ExamQuestion from '../models/ExamQuestion.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Recruitment from '../models/Recruitment.js';
import ExamAllowlist from '../models/ExamAllowlist.js';
import auth from '../middleware/auth.js';
import { generateExamQuestions } from '../lib/groq.js';
import mongoose from 'mongoose';

const router = express.Router();

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

    // 1. Check if user applied for recruitment
    let candidate = await Recruitment.findOne({ email: normalizedEmail });
    
    // 2. If not in recruitment, check Allowlist
    if (!candidate) {
        candidate = await ExamAllowlist.findOne({ email: normalizedEmail });
    }

    if (!candidate) {
        return res.status(403).json({ error: 'You are not registered for the exam. Access denied.' });
    }

    const { name, rollNo } = candidate;

    // Check if already submitted
    const existing = await ExamSubmission.findOne({ email: normalizedEmail });
    if (existing && existing.status !== 'in-progress') {
      return res.status(400).json({ error: 'You have already submitted the exam.' });
    }

    // Fetch questions from DB only (Randomized 30)
    // AI generation removed to prevent rate limits during exam
    const dbQuestions = await ExamQuestion.find({ isActive: true }).lean();
    if (dbQuestions.length === 0) return res.status(500).json({ error: 'No questions available. Contact admin.' });
    
    // Shuffle and pick 30 (or less if not enough)
    const finalQuestions = dbQuestions.sort(() => Math.random() - 0.5).slice(0, 30);

    // Create submission record
    let submission = existing;
    if (!submission) {
        submission = new ExamSubmission({
            name, 
            email: normalizedEmail, 
            rollNo: rollNo || 'N/A', // Handle case where allowlist might miss rollNo if loose schema
            startedAt: new Date(),
            totalQuestions: finalQuestions.length,
            questionSnapshot: finalQuestions 
        });
        await submission.save();
    }

    // Return questions WITHOUT answers
    const clientQuestions = finalQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        type: q.type
    }));

    res.json({
        submissionId: submission._id,
        questions: clientQuestions,
        startedAt: submission.startedAt,
        timeLimit: 30, // minutes
        candidateName: name // Send back name for UI welcome
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'DB Error: Duplicate entry.' });
    }
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
        const submission = await ExamSubmission.findById(req.params.submissionId).select('status adminWarnings');
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

export default router;
