import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    source: { type: String, default: 'chatbot' },
    metadata: { type: Object, default: {} },
    createdAtIST: { type: String },
  },
  { timestamps: true },
);

// create a unique index on phone to prevent duplicates
LeadSchema.index({ phone: 1 }, { unique: true });

export default mongoose.model('Lead', LeadSchema);
