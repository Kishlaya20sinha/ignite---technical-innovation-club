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

import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// GET /api/events/:id/qr — admin: get QR code for attendance
router.get('/:id/qr', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/attend?event=${event._id}`;
        const qrImage = await QRCode.toDataURL(url);
        res.json({ qr: qrImage, url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/events/attend — public: mark attendance
router.post('/attend', async (req, res) => {
    try {
        const { eventId, email } = req.body;
        const registration = await EventRegistration.findOne({ eventId, email: email.toLowerCase().trim() });
        
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found for this email.' });
        }

        if (registration.attended) {
            return res.json({ message: 'Attendance already marked!', registration });
        }

        registration.attended = true;
        await registration.save();
        res.json({ message: 'Attendance marked successfully!', registration });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/events/:id/certificate-template — admin: upload PDF template
router.post('/:id/certificate-template', auth, upload.single('template'), async (req, res) => {
    try {
        let updateData = {};
        if (req.file) {
            const dir = 'uploads/templates/';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filename = `template_${req.params.id}_${Date.now()}.pdf`;
            const filepath = path.join(dir, filename);
            fs.writeFileSync(filepath, req.file.buffer);
            updateData.certificateTemplate = `/${filepath}`;
        }
        
        if (req.body.coords) {
            updateData.certificateCoords = JSON.parse(req.body.coords);
        }

        const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/events/:id/certificate-preview — admin: preview certificate
router.get('/:id/certificate-preview', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        let pdfDoc;
        if (event.certificateTemplate) {
            const templatePath = path.join(process.cwd(), event.certificateTemplate.startsWith('/') ? event.certificateTemplate.slice(1) : event.certificateTemplate);
            const templateBytes = fs.readFileSync(templatePath);
            pdfDoc = await PDFDocument.load(templateBytes);
        } else {
            // Create a basic template if none exists
            pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([841.89, 595.28]); // A4 Landscape
            page.drawRectangle({
                x: 20, y: 20, width: 801.89, height: 555.28,
                borderColor: rgb(0.97, 0.45, 0.08), borderWidth: 4
            });
        }

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        
        // Map fonts
        const fontMap = {
            'Helvetica': StandardFonts.Helvetica,
            'Helvetica-Bold': StandardFonts.HelveticaBold,
            'Times-Roman': StandardFonts.TimesRoman,
            'Times-Bold': StandardFonts.TimesRomanBold,
            'Courier': StandardFonts.Courier,
            'Courier-Bold': StandardFonts.CourierBold
        };
        const selectedFont = fontMap[event.certificateCoords?.name?.font] || StandardFonts.HelveticaBold;
        const font = await pdfDoc.embedFont(selectedFont);
        
        const coords = event.certificateCoords?.name || { x: 420, y: 300, size: 40, color: '#000000' };
        
        // Convert hex to RGB
        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return rgb(r, g, b);
        };
        const color = hexToRgb(coords.color || '#000000');
        const text = 'SAMPLE STUDENT NAME';
        const width = font.widthOfTextAtSize(text, coords.size || 40);
        
        // Draw dummy name for preview - centered
        firstPage.drawText(text, {
            x: coords.x - width / 2,
            y: coords.y - (coords.size || 40) / 2, // Half-size subtraction for better centering math
            size: coords.size || 40,
            font: font,
            color: color,
        });

        const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });
        res.json({ pdf: pdfBase64 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/events/:id/generate-certificates — admin: email all certificates
router.post('/:id/generate-certificates', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (!event.certificateTemplate) return res.status(400).json({ error: 'No template uploaded for this event.' });

        const registrations = await EventRegistration.find({ eventId: event._id, attended: true });
        if (registrations.length === 0) return res.status(400).json({ error: 'No participants have marked attendance for this event yet.' });
        const templatePath = path.join(process.cwd(), event.certificateTemplate.slice(1));
        const templateBytes = fs.readFileSync(templatePath);

        const fontMap = {
            'Helvetica': StandardFonts.Helvetica,
            'Helvetica-Bold': StandardFonts.HelveticaBold,
            'Times-Roman': StandardFonts.TimesRoman,
            'Times-Bold': StandardFonts.TimesRomanBold,
            'Courier': StandardFonts.Courier,
            'Courier-Bold': StandardFonts.CourierBold
        };
        const selectedFont = fontMap[event.certificateCoords?.name?.font] || StandardFonts.HelveticaBold;

        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return rgb(r, g, b);
        };
        const coords = event.certificateCoords?.name || { x: 420, y: 300, size: 40, color: '#000000' };
        const color = hexToRgb(coords.color || '#000000');

        let count = 0;
        for (const reg of registrations) {
            const pdfDoc = await PDFDocument.load(templateBytes);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const font = await pdfDoc.embedFont(selectedFont);
            
            const text = reg.name.toUpperCase();
            const width = font.widthOfTextAtSize(text, coords.size || 40);
            
            firstPage.drawText(text, {
                x: coords.x - width / 2,
                y: coords.y - (coords.size || 40) / 2, // Half-size subtraction for better centering math
                size: coords.size || 40,
                font: font,
                color: color,
            });

            const pdfBytes = await pdfDoc.save();
            
            await sendEmail(
                reg.email,
                `Certificate of Achievement: ${event.name}`,
                `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #f97316;">Congratulations!</h2>
                    <p>Hi <strong>${reg.name}</strong>,</p>
                    <p>Please find attached your digital certificate for participating in <strong>${event.name}</strong>.</p>
                    <p>Keep burning bright!</p>
                    <br/>
                    <p>Best Regards,<br/><strong>Team IGNITE</strong></p>
                </div>
                `,
                [{
                    filename: `Certificate_${reg.name.replace(/\s+/g, '_')}.pdf`,
                    content: Buffer.from(pdfBytes)
                }]
            );
            count++;
        }

        res.json({ message: `Successfully generated and emailed ${count} certificates.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
