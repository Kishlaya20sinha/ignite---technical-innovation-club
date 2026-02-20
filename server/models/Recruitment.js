import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  branch: { type: String, required: true, trim: true },
  batch: { type: String, default: '2025' },
  interests: [{ type: String, enum: ['Ignite Club', 'BITP Esports'] }],
  esportsGame: { type: String },
  resume: { type: String }, // URL to resume (optional)
  whyJoin: { type: String, required: true },
  status: { type: String, enum: ['pending', 'shortlisted', 'rejected', 'accepted'], default: 'pending' },
}, { timestamps: true });

recruitmentSchema.index({ email: 1 }, { unique: true });
recruitmentSchema.index({ rollNo: 1 }, { unique: true });

export default mongoose.model('Recruitment', recruitmentSchema);
