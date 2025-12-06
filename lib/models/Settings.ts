import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  hotelName: string;
  taxRate: number;
  currency: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  timezone?: string;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    hotelName: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      default: 'Hotel Management System',
    },
    taxRate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: 0,
      max: 100,
      default: 10,
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR'],
      default: 'INR',
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    checkInTime: {
      type: String,
      default: '14:00',
    },
    checkOutTime: {
      type: String,
      default: '11:00',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists - use a constant field
SettingsSchema.index({ hotelName: 1 }, { unique: true, sparse: true });

// Delete existing model if it exists to force schema reload
if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

const Settings: Model<ISettings> = mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;

