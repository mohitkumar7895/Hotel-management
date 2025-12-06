import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  invoiceId?: mongoose.Types.ObjectId;
  amount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'netbanking';
  paymentDate: Date;
  reference?: string; // Transaction reference number
  notes?: string;
  receivedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      // Completely optional - no required field, allows null/undefined
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0'],
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking'],
      required: [true, 'Payment mode is required'],
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes - make invoiceId index sparse so it doesn't require the field
PaymentSchema.index({ invoiceId: 1 }, { sparse: true });
PaymentSchema.index({ paymentDate: -1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

