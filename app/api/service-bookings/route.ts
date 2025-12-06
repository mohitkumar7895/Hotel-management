import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceBooking from '@/lib/models/ServiceBooking';
import ExtraService from '@/lib/models/ExtraService';
import Guest from '@/lib/models/Guest';
import Booking from '@/lib/models/Booking';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET - Fetch all service bookings with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const guestId = searchParams.get('guestId');
    const bookingId = searchParams.get('bookingId');
    const serviceId = searchParams.get('serviceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (guestId && mongoose.Types.ObjectId.isValid(guestId)) {
      query.guestId = new mongoose.Types.ObjectId(guestId);
    }

    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      query.bookingId = new mongoose.Types.ObjectId(bookingId);
    }

    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
      query.serviceId = new mongoose.Types.ObjectId(serviceId);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const bookings = await ServiceBooking.find(query)
      .populate('serviceId', 'name category price unit')
      .populate('guestId', 'name phone email')
      .populate('bookingId', 'checkIn checkOut status')
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Fetch service bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service bookings' },
      { status: 500 }
    );
  }
}

// POST - Create new service booking
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get any user for requestedBy (skip authentication for development)
    let userId = null;
    const anyUser = await User.findOne();
    if (anyUser) {
      userId = anyUser._id;
    } else {
      return NextResponse.json({ error: 'No user found. Please create a user first.' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      serviceId, 
      guestId, 
      bookingId, 
      quantity, 
      scheduledDate, 
      scheduledTime, 
      notes,
      paymentMode,
      paymentStatus 
    } = body;

    // Validation
    if (!serviceId || !guestId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, guestId, quantity' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch service to get price
    const service = await ExtraService.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (!service.isAvailable) {
      return NextResponse.json({ error: 'Service is not available' }, { status: 400 });
    }

    // Verify guest exists
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Calculate total amount based on unit
    let unitPrice = service.price;
    let totalAmount = service.price * quantity;

    if (service.unit === 'per_hour' && scheduledDate) {
      // For hourly services, calculate based on duration
      const duration = service.duration || 60; // default 1 hour
      const hours = duration / 60;
      unitPrice = service.price * hours;
      totalAmount = unitPrice * quantity;
    }

    // Validate bookingId if provided
    let bookingIdObj = undefined;
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      bookingIdObj = new mongoose.Types.ObjectId(bookingId);
    }

    // Create service booking
    const serviceBooking = await ServiceBooking.create({
      serviceId: new mongoose.Types.ObjectId(serviceId),
      guestId: new mongoose.Types.ObjectId(guestId),
      bookingId: bookingIdObj,
      quantity: parseInt(quantity),
      unitPrice,
      totalAmount,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      scheduledTime: scheduledTime?.trim() || undefined,
      status: 'pending',
      paymentStatus: paymentStatus || 'pending',
      paymentMode: paymentMode || undefined,
      notes: notes?.trim() || undefined,
      requestedBy: userId,
    });

    // If payment is made, create revenue transaction
    if (paymentStatus === 'paid' && paymentMode) {
      await Transaction.create({
        type: 'revenue',
        category: service.category === 'spa' ? 'Spa' : 
                  service.category === 'laundry' ? 'Laundry' :
                  service.category === 'restaurant' ? 'Restaurant' : 'Others',
        amount: totalAmount,
        date: new Date(),
        paymentMode,
        description: `${service.name} service for ${guest.name}`,
        bookingId: bookingIdObj,
        createdBy: userId,
      });
    }

    // Populate and return
    const populatedBooking = await ServiceBooking.findById(serviceBooking._id)
      .populate('serviceId', 'name category price unit')
      .populate('guestId', 'name phone email')
      .populate('bookingId', 'checkIn checkOut status')
      .lean();

    return NextResponse.json({ 
      booking: populatedBooking,
      message: 'Service booking created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create service booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service booking' },
      { status: 500 }
    );
  }
}

