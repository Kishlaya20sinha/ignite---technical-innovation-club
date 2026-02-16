import mongoose from 'mongoose';

const examSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  rollNo: { type: String, required: true, trim: true },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedAnswer: Number }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date },
  violations: { type: Number, default: 0 }, // Tab switches, etc.
  violationLog: [{ type: { type: String }, timestamp: Date }],
  status: { type: String, enum: ['in-progress', 'submitted', 'auto-submitted'], default: 'in-progress' },
}, { timestamps: true });

examSubmissionSchema.index({ rollNo: 1 }, { unique: true });

export default mongoose.model('ExamSubmission', examSubmissionSchema);
