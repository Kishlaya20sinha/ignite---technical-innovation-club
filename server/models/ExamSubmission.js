import mongoose from 'mongoose';

const examSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  rollNo: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedAnswer: mongoose.Schema.Types.Mixed }], // Changed to Mixed for Input type string answers
  // Snapshot of questions given to this user (for AI generated papers)
  questionSnapshot: [{
      _id: mongoose.Schema.Types.ObjectId,
      question: String,
      options: [String],
      type: { type: String, enum: ['mcq', 'input'], default: 'mcq' },
      correctAnswer: mongoose.Schema.Types.Mixed
  }],
  adminWarnings: [{ message: String, timestamp: Date }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date },
  violations: { type: Number, default: 0 }, // Tab switches, etc.
  violationLog: [{ type: { type: String }, timestamp: Date }],
  extraMinutes: { type: Number, default: 0 },
  status: { type: String, enum: ['in-progress', 'submitted', 'auto-submitted'], default: 'in-progress' },
}, { timestamps: true });

examSubmissionSchema.index({ rollNo: 1 }, { unique: true });

export default mongoose.model('ExamSubmission', examSubmissionSchema);
