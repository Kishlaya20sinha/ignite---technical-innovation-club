import express from 'express';
import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { sendEmail } from '../lib/mailer.js';

const router = express.Router();

// Multer Config (Memory Storage for Sharp processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to process and save image
const saveImage = async (buffer) => {
    const dir = 'uploads/events/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const filename = `${Date.now()}.jpeg`;
    const filepath = path.join(dir, filename);
    
    await sharp(buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true }) // Resize to reasonable max dimensions
        .jpeg({ quality: 80 }) // Compress to JPEG with 80% quality
        .toFile(filepath);
        
    return `/${dir}${filename}`;
};

// ===== EVENT MANAGEMENT (Admin) =====

// POST /api/events — admin: create event
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const eventData = req.body;
    if (req.file) {
        eventData.image = await saveImage(req.file.buffer);
    }
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/events — public: list active events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/all — admin: list all events
router.get('/all', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id — admin: update event
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const updateData = req.body;
    if (req.file) {
        updateData.image = await saveImage(req.file.buffer);
    }
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/events/:id — admin: delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);
    
    // Delete registrations for this event
    await EventRegistration.deleteMany({ eventId: req.params.id });

    // If it's a mega event, delete its sub-events and their registrations
    if (event.type === 'mega') {
        const subEvents = await Event.find({ parentId: req.params.id });
        for (const sub of subEvents) {
            await EventRegistration.deleteMany({ eventId: sub._id });
            await Event.findByIdAndDelete(sub._id);
        }
    }

    res.json({ message: 'Event and related data deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== EVENT REGISTRATION (Public) =====

// POST /api/events/register — public: register for event
router.post('/register', async (req, res) => {
  try {
    const registration = new EventRegistration(req.body);
    await registration.save();
    
    // Fetch event details for the email
    const event = await Event.findById(req.body.eventId);
    
    if (event) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #f97316;">Registration Confirmed!</h2>
            <p>Hi <strong>${registration.name}</strong>,</p>
            <p>You have successfully registered for <strong>${event.name}</strong>.</p>
            <hr/>
            <p><strong>Event Details:</strong></p>
            <ul>
                <li><strong>Date:</strong> ${event.date ? new Date(event.date).toDateString() : 'TBA'}</li>
                <li><strong>Venue:</strong> ${event.venue || 'TBA'}</li>
            </ul>
            <p>${event.description || ''}</p>
            <br/>
            <p>See you there!</p>
            <p><strong>Team IGNITE</strong></p>
          </div>
        `;
        
        sendEmail(registration.email, `Registration Confirmed: ${event.name}`, emailHtml).catch(err => console.error('Event registration email failed:', err));
    }

    res.status(201).json({ message: 'Registered successfully!', id: registration._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You are already registered for this event.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// GET /api/events/registrations — admin: get all registrations
router.get('/registrations', auth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find().populate('eventId').sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/registrations/:eventId — admin: registrations for specific event
router.get('/registrations/:eventId', auth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
