import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const bookings = await Booking.find()
      .populate('guestId', 'name email phone')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

