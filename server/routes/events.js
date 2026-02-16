import express from 'express';
import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ===== EVENT MANAGEMENT (Admin) =====

// POST /api/events — admin: create event
router.post('/', auth, async (req, res) => {
  try {
    const event = new Event(req.body);
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
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
