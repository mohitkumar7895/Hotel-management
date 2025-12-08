import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccount extends Document {
  bookingId?: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema: Schema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Account type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Account: Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

export default Account;




