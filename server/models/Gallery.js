import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true }, // Image URL or path
    category: { type: String, default: 'General' },
    date: { type: Date, default: Date.now },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
