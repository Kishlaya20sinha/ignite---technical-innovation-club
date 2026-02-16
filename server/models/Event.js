import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  date: { type: Date },
  venue: { type: String },
  type: { type: String, enum: ['standalone', 'mega'], default: 'standalone' },
  isTeamEvent: { type: Boolean, default: false },
  maxTeamSize: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  category: { type: String, default: 'Inginiux 2.0' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  image: { type: String },
  registrationsOpen: { type: Boolean, default: true },
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

eventSchema.virtual('subEvents', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'parentId',
});

export default mongoose.model('Event', eventSchema);
