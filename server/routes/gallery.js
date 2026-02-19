import express from 'express';
import Gallery from '../models/Gallery.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const router = express.Router();

// Multer Config (Memory Storage for Sharp processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to process and save image
const saveImage = async (buffer) => {
    const dir = 'uploads/gallery/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpeg`;
    const filepath = path.join(dir, filename);
    
    await sharp(buffer)
        .resize(1200, 900, { fit: 'inside', withoutEnlargement: true }) // Larger for gallery
        .jpeg({ quality: 80 })
        .toFile(filepath);
        
    return `/${dir}${filename}`;
};

// GET /api/gallery — public: list gallery items
router.get('/', async (req, res) => {
    try {
        const items = await Gallery.find().sort({ date: -1, order: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/gallery — admin: add item
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.image = await saveImage(req.file.buffer);
        } else if (!data.image) {
            return res.status(400).json({ error: 'Image is required' });
        }
        const item = new Gallery(data);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/gallery/:id — admin: update item
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.image = await saveImage(req.file.buffer);
        }
        const item = await Gallery.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/gallery/:id — admin: delete item
router.delete('/:id', auth, async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted from gallery' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
