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
  reminderSent: { type: Boolean, default: false },
  certificateTemplate: { type: String }, // Path to PDF template
  certificateCoords: {
    name: {
        x: { type: Number, default: 300 },
        y: { type: Number, default: 400 },
        size: { type: Number, default: 40 },
        color: { type: String, default: '#000000' },
        font: { type: String, default: 'Helvetica-Bold' },
    }
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

eventSchema.virtual('subEvents', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'parentId',
});

export default mongoose.model('Event', eventSchema);
