import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuest extends Document {
  name: string;
  phone: string;
  email: string;
  address: string;
  idProof: string;
  checkIn?: Date;
  checkOut?: Date;
  roomId?: mongoose.Types.ObjectId;
  roomTypeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    idProof: {
      type: String,
      required: [true, 'ID proof is required'],
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
    roomTypeId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Guest: Model<IGuest> = mongoose.models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);

export default Guest;


