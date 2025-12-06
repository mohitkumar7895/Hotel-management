import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceBooking from '@/lib/models/ServiceBooking';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET - Fetch single service booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const booking = await ServiceBooking.findById(params.id)
      .populate('serviceId', 'name category price unit')
      .populate('guestId', 'name phone email')
      .populate('bookingId', 'checkIn checkOut status')
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean();

    if (!booking) {
      return NextResponse.json({ error: 'Service booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Fetch service booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service booking' },
      { status: 500 }
    );
  }
}

// PUT - Update service booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get any user for updates (skip authentication for development)
    let userId = null;
    const anyUser = await User.findOne();
    if (anyUser) {
      userId = anyUser._id;
    }

    const body = await request.json();
    const { 
      status, 
      paymentStatus, 
      paymentMode, 
      scheduledDate, 
      scheduledTime, 
      notes,
      assignedTo,
      quantity 
    } = body;

    const booking = await ServiceBooking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Service booking not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
    }

    if (paymentMode !== undefined) {
      updateData.paymentMode = paymentMode;
    }

    if (scheduledDate !== undefined) {
      updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : undefined;
    }

    if (scheduledTime !== undefined) {
      updateData.scheduledTime = scheduledTime?.trim() || undefined;
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || undefined;
    }

    if (assignedTo !== undefined) {
      if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
        updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo);
      } else {
        updateData.assignedTo = undefined;
      }
    }

    // If quantity changes, recalculate total
    if (quantity !== undefined && quantity > 0) {
      updateData.quantity = parseInt(quantity);
      updateData.totalAmount = booking.unitPrice * quantity;
    }

    // Update booking
    Object.assign(booking, updateData);
    await booking.save();

    // If payment status changes to paid, create revenue transaction
    if (paymentStatus === 'paid' && paymentMode && booking.paymentStatus !== 'paid') {
      await Transaction.create({
        type: 'revenue',
        category: (booking.serviceId as any).category === 'spa' ? 'Spa' : 
                  (booking.serviceId as any).category === 'laundry' ? 'Laundry' :
                  (booking.serviceId as any).category === 'restaurant' ? 'Restaurant' : 'Others',
        amount: booking.totalAmount,
        date: new Date(),
        paymentMode,
        description: `Service booking payment: ${(booking.serviceId as any).name}`,
        bookingId: booking.bookingId,
        createdBy: userId,
      });
    }

    // Populate and return
    const updatedBooking = await ServiceBooking.findById(booking._id)
      .populate('serviceId', 'name category price unit')
      .populate('guestId', 'name phone email')
      .populate('bookingId', 'checkIn checkOut status')
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean();

    return NextResponse.json({ 
      booking: updatedBooking,
      message: 'Service booking updated successfully'
    });
  } catch (error: any) {
    console.error('Update service booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service booking' },
      { status: 500 }
    );
  }
}

// DELETE - Delete service booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const booking = await ServiceBooking.findByIdAndDelete(params.id);

    if (!booking) {
      return NextResponse.json({ error: 'Service booking not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Service booking deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete service booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service booking' },
      { status: 500 }
    );
  }
}

