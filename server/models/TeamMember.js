import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  image: { type: String }, // URL or path to image
  socials: {
    linkedin: String,
    github: String,
    twitter: String,
    instagram: String,
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
