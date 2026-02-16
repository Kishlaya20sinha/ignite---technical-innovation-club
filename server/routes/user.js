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

export default router;
