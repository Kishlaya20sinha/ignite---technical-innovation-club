import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String },           // uploaded file path (cover)
    images: [{ type: String }],        // array of uploaded file paths (album gallery)
    coverUrl: { type: String },        // direct external image URL as cover
    link: { type: String },            // Google Photos album link (or any external URL)
    category: { type: String, default: 'General' },
    date: { type: Date, default: Date.now },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
