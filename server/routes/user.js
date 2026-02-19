import express from 'express';
import Recruitment from '../models/Recruitment.js';

const router = express.Router();

// GET /api/user/check/:email — public: check if user exists (for auto-fill)
router.get('/check/:email', async (req, res) => {
  try {
    const user = await Recruitment.findOne({ email: req.params.email }).select('name email phone rollNo branch batch');
    if (user) {
      res.json({ found: true, user });
    } else {
      res.json({ found: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... (existing index route if any)

router.get('/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const [recruitment, events, exams] = await Promise.all([
            Recruitment.findOne({ email }).select('status interests branch batch'),
            EventRegistration.find({ email }).populate('eventId', 'name date venue type'),
            ExamSubmission.find({ email }).select('score totalQuestions status startedAt')
        ]);

        res.json({
            recruitment,
            events,
            exams
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
