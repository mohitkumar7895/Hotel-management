import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoomType extends Document {
  name: string;
  description: string;
  price: number;
  amenities: string[];
  maxGuests: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Room type name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Max guests is required'],
      min: 1,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const RoomType: Model<IRoomType> = mongoose.models.RoomType || mongoose.model<IRoomType>('RoomType', RoomTypeSchema);

export default RoomType;




