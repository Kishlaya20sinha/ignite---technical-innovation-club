import mongoose from 'mongoose';

const examQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of 4 options
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Index (0-3) or String answer
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  category: { type: String, default: 'aptitude' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('ExamQuestion', examQuestionSchema);
