import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExtraService extends Document {
  name: string;
  price: number;
  icon?: string;
  description?: string;
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    icon: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ExtraService: Model<IExtraService> = mongoose.models.ExtraService || mongoose.model<IExtraService>('ExtraService', ExtraServiceSchema);

export default ExtraService;



