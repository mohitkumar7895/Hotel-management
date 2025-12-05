import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceRequest extends Document {
  roomId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  notes?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema: Schema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'ExtraService',
      required: [true, 'Service is required'],
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest: Model<IServiceRequest> = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);

export default ServiceRequest;


