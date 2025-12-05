import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  roomTypeId: mongoose.Types.ObjectId;
  floor: number;
  status: 'available' | 'booked' | 'cleaning' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type is required'],
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'cleaning', 'maintenance'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;


