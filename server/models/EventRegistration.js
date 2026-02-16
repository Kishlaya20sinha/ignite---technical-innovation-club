import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  branch: { type: String },
  teamName: { type: String },
  teamMembers: [{ name: String, rollNo: String, email: String }],
}, { timestamps: true });

eventRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export default mongoose.model('EventRegistration', eventRegistrationSchema);
