import express from 'express';
import TeamMember from '../models/TeamMember.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/team — public: get active members
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/team — admin: add member
router.post('/', auth, async (req, res) => {
  try {
    const member = new TeamMember(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/team/all — admin: all members
router.get('/all', auth, async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/team/:id — admin: update member
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/team/:id — admin: delete member
router.delete('/:id', auth, async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
