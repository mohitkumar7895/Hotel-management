import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceBooking from '@/lib/models/ServiceBooking';
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

    await connectDB();

    // Get user email from token
    const userEmail = payload.email;

    // Find guest by email
    const guest = await Guest.findOne({ email: userEmail.toLowerCase() });
    if (!guest) {
      return NextResponse.json({ services: [] });
    }

    // Get bookingId from query params if provided
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    // Find all service bookings for this guest
    let query: any = { guestId: guest._id };
    if (bookingId) {
      query.bookingId = bookingId;
    }

    const serviceBookings = await ServiceBooking.find(query)
      .populate('serviceId', 'name category price unit description')
      .populate('bookingId', 'roomId checkIn checkOut')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ services: serviceBookings });
  } catch (error: any) {
    console.error('User services error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}


