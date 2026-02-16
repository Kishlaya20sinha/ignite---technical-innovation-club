import mongoose from 'mongoose';

const examAllowlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true },
  rollNo: { type: String, required: true }, // Optional if not strictly needed, but good for records
  canTakeExam: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ExamAllowlist', examAllowlistSchema);
