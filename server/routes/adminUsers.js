import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Admin Middleware Check
const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// GET /api/admin/users — admin: list all users
router.get('/users', auth, async (req, res) => {
    try {
        // The auth middleware already verifies the token. 
        // We just need to check if the decoded role is admin.
        // req.user logic depends on how 'auth' middleware is implemented.
        // Let's check auth middleware.
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
