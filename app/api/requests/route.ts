import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServiceRequest from '@/lib/models/ServiceRequest';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

// GET - Fetch all service requests with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const requestType = searchParams.get('requestType');
    const roomId = searchParams.get('roomId');
    const guestId = searchParams.get('guestId');
    const assignedTo = searchParams.get('assignedTo');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (requestType) {
      query.requestType = requestType;
    }

    if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
      query.roomId = new mongoose.Types.ObjectId(roomId);
    }

    if (guestId && mongoose.Types.ObjectId.isValid(guestId)) {
      query.guestId = new mongoose.Types.ObjectId(guestId);
    }

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = new mongoose.Types.ObjectId(assignedTo);
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

    const requests = await ServiceRequest.find(query)
      .populate('roomId', 'roomNumber roomTypeId')
      .populate('guestId', 'name phone email')
      .populate('bookingId', 'checkIn checkOut status')
      .populate('serviceId', 'name category price')
      .populate('assignedTo', 'name email')
      .populate('requestedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    // Get statistics
    const stats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await ServiceRequest.aggregate([
      {
        $match: { status: { $in: ['pending', 'in-progress'] } },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      requests,
      statistics: {
        byStatus: stats.map((item) => ({
          status: item._id,
          count: item.count,
        })),
        byPriority: priorityStats.map((item) => ({
          priority: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create new service request
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get any user for requestedBy (skip authentication for development)
    let userId = null;
    const anyUser = await User.findOne();
    if (anyUser) {
      userId = anyUser._id;
    }

    const body = await request.json();
    const {
      roomId,
      guestId,
      bookingId,
      serviceId,
      requestType,
      priority,
      notes,
      assignedTo,
      estimatedTime,
    } = body;

    // Validation
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room is required' },
        { status: 400 }
      );
    }

    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json(
        { error: 'Invalid room ID format' },
        { status: 400 }
      );
    }

    console.log('📝 Creating service request:', {
      roomId,
      guestId,
      bookingId,
      serviceId,
      requestType,
      priority,
    });

    const requestData: any = {
      roomId: new mongoose.Types.ObjectId(roomId),
      requestType: requestType || 'service',
      priority: priority || 'medium',
      status: 'pending',
    };

    // Only add optional fields if they are valid
    if (guestId && typeof guestId === 'string' && guestId.trim() !== '' && mongoose.Types.ObjectId.isValid(guestId.trim())) {
      requestData.guestId = new mongoose.Types.ObjectId(guestId.trim());
    }

    if (bookingId && typeof bookingId === 'string' && bookingId.trim() !== '' && mongoose.Types.ObjectId.isValid(bookingId.trim())) {
      requestData.bookingId = new mongoose.Types.ObjectId(bookingId.trim());
    }

    // Only add serviceId if provided and valid - otherwise don't include it at all
    if (serviceId && typeof serviceId === 'string' && serviceId.trim() !== '' && mongoose.Types.ObjectId.isValid(serviceId.trim())) {
      requestData.serviceId = new mongoose.Types.ObjectId(serviceId.trim());
    }
    // If serviceId is not provided, don't include it in requestData (Mongoose will use default/null)

    if (notes && typeof notes === 'string' && notes.trim() !== '') {
      requestData.notes = notes.trim();
    }

    if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '' && mongoose.Types.ObjectId.isValid(assignedTo.trim())) {
      requestData.assignedTo = new mongoose.Types.ObjectId(assignedTo.trim());
    }

    if (estimatedTime && !isNaN(parseInt(estimatedTime))) {
      requestData.estimatedTime = parseInt(estimatedTime);
    }

    if (userId) {
      requestData.requestedBy = userId;
    }

    // IMPORTANT: Remove serviceId from requestData if it's not provided to avoid validation errors
    if (!requestData.serviceId || requestData.serviceId === null || requestData.serviceId === undefined) {
      delete requestData.serviceId;
    }

    console.log('💾 Saving request data to MongoDB Atlas:', {
      roomId: requestData.roomId.toString(),
      requestType: requestData.requestType,
      priority: requestData.priority,
      hasGuestId: !!requestData.guestId,
      hasServiceId: 'serviceId' in requestData,
      serviceIdValue: requestData.serviceId ? requestData.serviceId.toString() : 'not included',
    });

    try {
      const serviceRequest = await ServiceRequest.create(requestData);
      console.log('✅ Request created successfully in MongoDB Atlas:', serviceRequest._id);

      // Populate and return
      const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
        .populate('roomId', 'roomNumber roomTypeId')
        .populate('guestId', 'name phone email')
        .populate('bookingId', 'checkIn checkOut status')
        .populate('serviceId', 'name category price')
        .populate('assignedTo', 'name email')
        .populate('requestedBy', 'name email')
        .lean();

      console.log('✅ Request populated successfully');

      return NextResponse.json({
        request: populatedRequest,
        message: 'Service request created successfully in MongoDB Atlas',
      }, { status: 201 });
    } catch (createError: any) {
      console.error('❌ Request creation error:', createError);
      // Provide more detailed error message
      if (createError.name === 'ValidationError') {
        const errors = Object.keys(createError.errors).map(key => ({
          field: key,
          message: createError.errors[key].message,
        }));
        return NextResponse.json(
          { error: `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}` },
          { status: 400 }
        );
      }
      throw createError;
    }
  } catch (error: any) {
    console.error('❌ Create request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create request' },
      { status: 500 }
    );
  }
}

