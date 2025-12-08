import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  date: Date;
  reference?: string; // Booking ID, Service ID, etc.
  paymentMode: 'cash' | 'card' | 'upi' | 'netbanking';
  description?: string;
  bookingId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['revenue', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking'],
      required: [true, 'Payment mode is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1, date: -1 });
TransactionSchema.index({ category: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;


