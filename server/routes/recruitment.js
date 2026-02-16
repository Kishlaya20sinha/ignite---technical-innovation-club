import express from 'express';
import Recruitment from '../models/Recruitment.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /api/recruit — public: submit application
router.post('/', async (req, res) => {
  try {
    const application = new Recruitment(req.body);
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully!', id: application._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already applied with this email or roll number.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// GET /api/recruit — admin: get all applications
router.get('/', auth, async (req, res) => {
  try {
    const applications = await Recruitment.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/recruit/:id — admin: update status
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Recruitment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/recruit/:id — admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
