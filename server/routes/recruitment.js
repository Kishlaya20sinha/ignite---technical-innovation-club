import express from 'express';
import mongoose from 'mongoose';
import Recruitment from '../models/Recruitment.js';
import auth from '../middleware/auth.js';
import { sendEmail } from '../lib/mailer.js';

const router = express.Router();

// Reuse SystemConfig model safely
const SystemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now }
});
const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

// POST /api/recruit — public: submit application
router.post('/', async (req, res) => {
  try {
    const application = new Recruitment(req.body);
    await application.save();

    // Fetch WhatsApp group link from config (fallback to default)
    let whatsappLink = 'https://chat.whatsapp.com/G8Ds9PBrIlpFV5lpvClOVV?mode=gi_t';
    try {
      const config = await SystemConfig.findOne({ key: 'whatsappGroupLink' });
      if (config && config.value) whatsappLink = config.value;
    } catch (_) {}

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Application Received! 🎉</h2>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
          <p>Hi <strong>${application.name}</strong>,</p>
          <p>Thanks for applying to <strong>IGNITE Technical Innovation Club</strong>!</p>
          <p>We have received your application. We'll review it and get back to you soon regarding the next steps.</p>
          <p><strong>Roll No:</strong> ${application.rollNo}</p>
          <p><strong>Interests:</strong> ${Array.isArray(application.interests) ? application.interests.join(', ') : application.interests}</p>

          <div style="background: #25D366; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="color: white; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">📱 Join our WhatsApp Group</p>
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 16px 0; font-size: 14px;">Stay updated with all IGNITE announcements and news!</p>
            <a href="${whatsappLink}" target="_blank" style="display: inline-block; background: white; color: #25D366; font-weight: bold; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px;">
              Join WhatsApp Group →
            </a>
          </div>

          <p style="color: #888; font-size: 13px;">If the button above doesn't work, copy and paste this link:<br/>
          <a href="${whatsappLink}" style="color: #f97316;">${whatsappLink}</a></p>

          <br/>
          <p>Best Regards,</p>
          <p><strong>Team IGNITE</strong></p>
        </div>
      </div>
    `;
    
    // Don't block the response if email fails
    sendEmail(application.email, 'IGNITE Recruitment: Application Received', emailHtml)
      .catch(err => console.error('Recruitment email failed:', err));

    res.status(201).json({ message: 'Application submitted successfully!', id: application._id, whatsappLink });
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
