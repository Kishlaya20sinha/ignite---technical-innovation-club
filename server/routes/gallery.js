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
        .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
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
router.post('/', auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 50 }]), async (req, res) => {
    try {
        const data = { ...req.body };

        // 1. Process Cover Image
        if (req.files['image']) {
            data.image = await saveImage(req.files['image'][0].buffer);
        } else if (!data.coverUrl) {
            return res.status(400).json({ error: 'Please provide a cover image (upload or URL).' });
        }

        // 2. Process Gallery Images (Album)
        if (req.files['images']) {
            const galleryPaths = [];
            for (const file of req.files['images']) {
                const path = await saveImage(file.buffer);
                galleryPaths.push(path);
            }
            data.images = galleryPaths;
        }

        const item = new Gallery(data);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/gallery/:id — admin: update item
router.put('/:id', auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 50 }]), async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.files['image']) {
            data.image = await saveImage(req.files['image'][0].buffer);
        }

        if (req.files['images']) {
            const galleryPaths = [];
            for (const file of req.files['images']) {
                const path = await saveImage(file.buffer);
                galleryPaths.push(path);
            }
            data.images = galleryPaths;
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
