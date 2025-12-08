import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Only select needed fields for dashboard performance - minimal populate
    const bookings = await Booking.find()
      .select('checkIn checkOut status totalAmount createdAt')
      .populate('guestId', 'name')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ bookings }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

