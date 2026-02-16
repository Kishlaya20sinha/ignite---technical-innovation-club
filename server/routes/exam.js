import express from 'express';
import ExamQuestion from '../models/ExamQuestion.js';
import ExamSubmission from '../models/ExamSubmission.js';
import auth from '../middleware/auth.js';

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
    const { name, email, rollNo } = req.body;
    
    // Check if already submitted
    const existing = await ExamSubmission.findOne({ rollNo });
    if (existing && existing.status !== 'in-progress') {
      return res.status(400).json({ error: 'You have already submitted the exam.' });
    }

    // Get active questions (WITHOUT correct answers)
    const questions = await ExamQuestion.find({ isActive: true })
      .select('-correctAnswer')
      .lean();

    // Shuffle questions
    const shuffled = questions.sort(() => Math.random() - 0.5);

    // Create or update submission record
    let submission = existing;
    if (!submission) {
      submission = new ExamSubmission({
        name, email, rollNo,
        startedAt: new Date(),
        totalQuestions: shuffled.length,
      });
      await submission.save();
    }

    res.json({
      submissionId: submission._id,
      questions: shuffled,
      startedAt: submission.startedAt,
      timeLimit: 30, // minutes
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already registered for this exam.' });
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

    // Grade answers
    const questions = await ExamQuestion.find({ isActive: true });
    const questionMap = {};
    questions.forEach(q => { questionMap[q._id.toString()] = q.correctAnswer; });

    let score = 0;
    answers.forEach(a => {
      if (questionMap[a.questionId] === a.selectedAnswer) score++;
    });

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
