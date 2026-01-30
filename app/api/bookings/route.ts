import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Room from '@/lib/models/Room';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Only select needed fields for dashboard performance - minimal populate
    const bookings = await Booking.find()
      .select('checkIn checkOut status totalAmount createdAt paymentStatus guestId roomId')
      .populate('guestId', 'name email phone')
      .populate({
        path: 'roomId',
        select: 'roomNumber',
        model: 'Room',
      })
      .sort({ createdAt: -1 })
      .lean();
    
    // Filter out bookings with null roomId or guestId
    const validBookings = bookings.filter(
      (booking: any) => booking.guestId && booking.roomId
    );
    
    return NextResponse.json({ bookings: validBookings }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { guestId, roomId, checkIn, checkOut, totalAmount, status, paymentStatus } = body;

    if (!guestId || !roomId || !checkIn || !checkOut || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
      $or: [
        {
          checkIn: { $lte: new Date(checkOut) },
          checkOut: { $gte: new Date(checkIn) },
        },
      ],
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Room is already booked for these dates' },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      guestId,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      totalAmount: parseFloat(totalAmount),
      status: status || 'pending',
      paymentStatus: paymentStatus || 'pending',
    });

    // Update room status
    await Room.findByIdAndUpdate(roomId, { status: 'booked' });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

