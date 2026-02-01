import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import Guest from '@/lib/models/Guest';
import Booking from '@/lib/models/Booking';
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
      return NextResponse.json({ bill: null });
    }

    // Find active booking
    const booking = await Booking.findOne({
      guestId: guest._id,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    });

    if (!booking) {
      return NextResponse.json({ bill: null });
    }

    // Find invoice for this booking
    const invoice = await Invoice.findOne({ bookingId: booking._id })
      .populate('roomId', 'roomNumber')
      .populate({
        path: 'roomId',
        populate: {
          path: 'roomTypeId',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!invoice) {
      return NextResponse.json({ bill: null });
    }

    return NextResponse.json({ bill: invoice });
  } catch (error: any) {
    console.error('User bill error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

