import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExtraService extends Document {
  name: string;
  category: 'spa' | 'laundry' | 'restaurant' | 'transport' | 'entertainment' | 'business' | 'wellness' | 'other';
  price: number;
  unit: 'per_hour' | 'per_day' | 'per_item' | 'per_service' | 'fixed';
  icon?: string;
  description?: string;
  duration?: number; // in minutes
  isAvailable: boolean;
  requiresBooking: boolean;
  maxCapacity?: number; // for services like spa, conference room
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExtraServiceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['spa', 'laundry', 'restaurant', 'transport', 'entertainment', 'business', 'wellness', 'other'],
      required: [true, 'Category is required'],
      default: 'other',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      type: String,
      enum: ['per_hour', 'per_day', 'per_item', 'per_service', 'fixed'],
      default: 'fixed',
    },
    icon: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    requiresBooking: {
      type: Boolean,
      default: false,
    },
    maxCapacity: {
      type: Number,
      min: 1,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ExtraServiceSchema.index({ category: 1 });
ExtraServiceSchema.index({ isAvailable: 1 });

const ExtraService: Model<IExtraService> = mongoose.models.ExtraService || mongoose.model<IExtraService>('ExtraService', ExtraServiceSchema);

export default ExtraService;



