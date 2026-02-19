import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../lib/mailer.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationCode: otp
    });

    await user.save();

    // Send OTP Email
    const emailHtml = `
      <div style="font-family: sans-serif; color: #333 text-align: center;">
        <h2 style="color: #f97316;">Verify Your Account</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your verification code for IGNITE is:</p>
        <div style="background: #f7f7f7; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; color: #f97316; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>Keep burning bright!</p>
        <br/>
        <p>Best Regards,<br/><strong>Team IGNITE</strong></p>
      </div>
    `;

    await sendEmail(email, 'Verify Your IGNITE Account', emailHtml);

    res.status(201).json({ message: 'Registration successful. Please check your email for verification code.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.verificationCode !== otp) return res.status(400).json({ error: 'Invalid verification code' });

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    // Generate Token
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { name: user.name, email: user.email, isVerified: user.isVerified } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

import auth from '../middleware/auth.js';

// POST /api/auth/complete-profile
router.post('/complete-profile', auth, async (req, res) => {
  try {
    const { phone, college, branch, batch } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.phone = phone;
    user.college = college;
    user.branch = branch;
    user.batch = batch;

    await user.save();

    res.json({ message: 'Profile completed successfully', user: { name: user.name, email: user.email, isVerified: user.isVerified } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login (User Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for Admin
    if (email === 'admin' || email === 'admin@ignite.com') {
        if (password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.json({ token, role: 'admin' });
        }
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) {
        return res.status(403).json({ error: 'Please verify your email first', email: user.email });
    }

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, isVerified: user.isVerified }, role: 'user' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/verify
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'admin') {
        return res.json({ valid: true, role: 'admin' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ valid: false });

    res.json({ valid: true, role: 'user', user: { name: user.name, email: user.email, isVerified: user.isVerified } });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;
