import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceBooking extends Document {
  serviceId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId; // Optional link to room booking
  guestId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  scheduledDate?: Date;
  scheduledTime?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentMode?: 'cash' | 'card' | 'upi' | 'netbanking';
  notes?: string;
  requestedBy?: mongoose.Types.ObjectId; // Staff who created the booking
  assignedTo?: mongoose.Types.ObjectId; // Staff assigned to handle
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBookingSchema: Schema = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'ExtraService',
      required: [true, 'Service is required'],
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    scheduledDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial'],
      default: 'pending',
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking'],
    },
    notes: {
      type: String,
      trim: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ServiceBookingSchema.index({ serviceId: 1 });
ServiceBookingSchema.index({ guestId: 1 });
ServiceBookingSchema.index({ bookingId: 1 });
ServiceBookingSchema.index({ status: 1 });
ServiceBookingSchema.index({ scheduledDate: 1 });
ServiceBookingSchema.index({ createdAt: -1 });

const ServiceBooking: Model<IServiceBooking> = mongoose.models.ServiceBooking || mongoose.model<IServiceBooking>('ServiceBooking', ServiceBookingSchema);

export default ServiceBooking;


