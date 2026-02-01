import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Guest from '@/lib/models/Guest';
import Room from '@/lib/models/Room';
import Invoice from '@/lib/models/Invoice';
import Payment from '@/lib/models/Payment';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// Generate invoice number
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000);
  return `INV-${year}-${String(random).padStart(4, '0')}`;
}

export async function POST(request: NextRequest) {
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

    // Only USER role can book rooms
    if (payload.role !== 'USER') {
      return NextResponse.json(
        { error: 'Only users can book rooms' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get user
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { roomId, checkIn, checkOut, name, phone, address, idProof, paymentMethod } = body;

    // Validation
    if (!roomId || !checkIn || !checkOut || !name || !phone || !address || !idProof) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Check if user already has an active booking
    const existingGuest = await Guest.findOne({ email: user.email.toLowerCase() });
    if (existingGuest) {
      const existingBooking = await Booking.findOne({
        guestId: existingGuest._id,
        status: { $in: ['pending', 'confirmed', 'checked-in'] },
      });

      if (existingBooking) {
        return NextResponse.json(
          { error: 'You already have an active booking. Only one booking at a time is allowed.' },
          { status: 400 }
        );
      }
    }

    // Check if room exists and is available
    const room = await Room.findById(roomId).populate('roomTypeId');
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
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Room is already booked for these dates' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomType = room.roomTypeId as any;
    const totalAmount = roomType?.price ? roomType.price * nights : 0;

    // Create or update guest record
    let guest;
    if (existingGuest) {
      // Update existing guest
      guest = await Guest.findByIdAndUpdate(
        existingGuest._id,
        {
          name,
          phone,
          address,
          idProof,
        },
        { new: true }
      );
    } else {
      // Create new guest
      guest = await Guest.create({
        name,
        email: user.email.toLowerCase(),
        phone,
        address,
        idProof,
      });
    }

    // Create booking
    const booking = await Booking.create({
      guestId: guest._id,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Update room status
    await Room.findByIdAndUpdate(roomId, { status: 'booked' });

    // Generate invoice
    const invoiceItems = [
      {
        description: `Room Charges (${nights} nights)`,
        quantity: nights,
        rate: roomType?.price || 0,
        amount: totalAmount,
      },
    ];

    const subtotal = totalAmount;
    const tax = 0; // Can be configured
    const discount = 0;
    const invoiceTotal = subtotal + tax - discount;

    // Generate unique invoice number
    let invoiceNumber = generateInvoiceNumber();
    while (await Invoice.findOne({ invoiceNumber })) {
      invoiceNumber = generateInvoiceNumber();
    }

    // Get any admin user for issuedBy
    const adminUser = await User.findOne({ role: { $in: ['admin', 'superadmin'] } }) || user;

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      bookingId: booking._id,
      guestId: guest._id,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      items: invoiceItems,
      subtotal,
      tax,
      discount,
      totalAmount: invoiceTotal,
      paidAmount: 0,
      dueAmount: invoiceTotal,
      paymentStatus: 'pending',
      paymentMode: paymentMethod || undefined,
      issuedBy: adminUser._id,
    });

    // If payment method is provided and not cash, create payment record
    if (paymentMethod && paymentMethod !== 'cash') {
      await Payment.create({
        invoiceId: invoice._id,
        amount: invoiceTotal,
        paymentMode: paymentMethod === 'card' ? 'card' : 'upi',
        paymentDate: new Date(),
        receivedBy: adminUser._id,
        notes: `Payment for booking ${booking._id}`,
      });

      // Update booking and invoice payment status
      await Booking.findByIdAndUpdate(booking._id, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });

      await Invoice.findByIdAndUpdate(invoice._id, {
        paidAmount: invoiceTotal,
        dueAmount: 0,
        paymentStatus: 'paid',
        paymentMode: paymentMethod,
      });
    }

    return NextResponse.json({
      success: true,
      booking,
      invoice,
      message: paymentMethod && paymentMethod !== 'cash' 
        ? 'Booking confirmed and payment processed' 
        : 'Booking created. Please complete payment to confirm.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Book room error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

