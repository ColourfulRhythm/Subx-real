import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  type: { type: String, required: true },
  propertyType: { type: String, enum: ['residential', 'commercial', 'industrial', 'mixed-use'], default: 'residential' },
  priceRange: { type: String },
  targetMarket: { type: String },
  completionDate: { type: Date },
  roi: { type: String },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  minInvestment: { type: Number },
  maxInvestment: { type: Number },
  imageUrls: [{ type: String }],
  amenities: [{ type: String }],
  developerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Developer' },
  amount: { type: String },
  status: { type: String, default: 'planning' },
  units: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    price: { type: Number, default: 0 }
  },
  soldUnits: { type: Number },
  startDate: { type: Date },
  expectedCompletion: { type: Date },
  investors: { type: Number },
  totalInvestment: { type: String }
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema); 