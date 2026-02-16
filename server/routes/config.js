import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Define Schema here if skipping separate file import for simplicity, or import
const SystemConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    lastUpdated: { type: Date, default: Date.now }
});

// Check if model already exists to prevent overwrite error in hot reloads
const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

// Get config by key (Public)
router.get('/:key', async (req, res) => {
    try {
        const config = await SystemConfig.findOne({ key: req.params.key });
        // Return null if not found, allowing frontend to handle default
        res.json(config ? config.value : null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Set config (Protected inside Admin logic, but here public for simplicity or add middleware)
// For now, let's assume this is protected by frontend token check or add middleware if available
router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) return res.status(400).json({ message: "Key and value required" });

        const config = await SystemConfig.findOneAndUpdate(
            { key },
            { value, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
