import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceRequest extends Document {
  roomId: mongoose.Types.ObjectId;
  guestId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId; // Optional - requests can be general without a specific service
  requestType: 'service' | 'maintenance' | 'housekeeping' | 'concierge' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: mongoose.Types.ObjectId;
  requestedBy?: mongoose.Types.ObjectId;
  completedAt?: Date;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
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
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'ExtraService',
      // NOT required - completely optional
      // Do not set required: false explicitly, just omit it
    },
    requestType: {
      type: String,
      enum: ['service', 'maintenance', 'housekeeping', 'concierge', 'other'],
      default: 'service',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
    estimatedTime: {
      type: Number,
      min: 0,
    },
    actualTime: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ priority: 1 });
ServiceRequestSchema.index({ roomId: 1 });
ServiceRequestSchema.index({ guestId: 1 });
ServiceRequestSchema.index({ createdAt: -1 });
ServiceRequestSchema.index({ assignedTo: 1 });

// Delete existing model if it exists to force schema reload
if (mongoose.models.ServiceRequest) {
  delete mongoose.models.ServiceRequest;
}

const ServiceRequest: Model<IServiceRequest> = mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);

export default ServiceRequest;




