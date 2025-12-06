import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceRequest from '@/lib/models/ServiceRequest';
import mongoose from 'mongoose';

// GET - Fetch single request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const serviceRequest = await ServiceRequest.findById(params.id)
      .populate('roomId', 'roomNumber roomTypeId')
      .populate('guestId', 'name phone email')
      .populate('bookingId', 'checkIn checkOut status')
      .populate('serviceId', 'name category price')
      .populate('assignedTo', 'name email')
      .populate('requestedBy', 'name email')
      .lean();

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request: serviceRequest });
  } catch (error: any) {
    console.error('Fetch request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// PUT - Update request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      status,
      priority,
      notes,
      assignedTo,
      estimatedTime,
      actualTime,
    } = body;

    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status !== 'completed' && status !== 'cancelled') {
        updateData.completedAt = undefined;
      }
    }

    if (priority !== undefined) {
      updateData.priority = priority;
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

    if (estimatedTime !== undefined) {
      updateData.estimatedTime = estimatedTime ? parseInt(estimatedTime) : undefined;
    }

    if (actualTime !== undefined) {
      updateData.actualTime = actualTime ? parseInt(actualTime) : undefined;
    }

    const serviceRequest = await ServiceRequest.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Populate and return
    const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('roomId', 'roomNumber roomTypeId')
      .populate('guestId', 'name phone email')
      .populate('bookingId', 'checkIn checkOut status')
      .populate('serviceId', 'name category price')
      .populate('assignedTo', 'name email')
      .populate('requestedBy', 'name email')
      .lean();

    return NextResponse.json({
      request: populatedRequest,
      message: 'Request updated successfully',
    });
  } catch (error: any) {
    console.error('Update request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const serviceRequest = await ServiceRequest.findByIdAndDelete(params.id);

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Request deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete request' },
      { status: 500 }
    );
  }
}

