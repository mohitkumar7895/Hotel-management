import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Guest from '@/lib/models/Guest';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('hotel-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only USER role can access
    if (payload.role !== 'USER') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get user email from token
    const userEmail = payload.email;

    // Find guest by email
    const guest = await Guest.findOne({ email: userEmail.toLowerCase() });
    if (!guest) {
      return NextResponse.json({ booking: null });
    }

    // Find active booking (pending, confirmed, or checked-in)
    const booking = await Booking.findOne({
      guestId: guest._id,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    })
      .populate('roomId', 'roomNumber')
      .populate({
        path: 'roomId',
        populate: {
          path: 'roomTypeId',
          select: 'name price amenities maxGuests description',
        },
      })
      .populate('guestId', 'name email phone address')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('User booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

