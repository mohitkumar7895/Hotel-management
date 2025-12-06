import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import Booking from '@/lib/models/Booking';
import Guest from '@/lib/models/Guest';
import Room from '@/lib/models/Room';
import RoomType from '@/lib/models/RoomType';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canView, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';

// Generate invoice number
function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    // Skip authentication check - allow access without auth
    await connectDB();

    await connectDB();

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    if (bookingId) query.bookingId = new mongoose.Types.ObjectId(bookingId);
    if (status) {
      const statuses = status.split(',');
      query.paymentStatus = { $in: statuses };
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('guestId', 'name email phone')
      .populate('roomId', 'roomNumber')
      .populate('bookingId', 'checkIn checkOut')
      .populate('issuedBy', 'name email')
      .lean();

    const total = await Invoice.countDocuments(query);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Skip authentication check
    await connectDB();
    
    // Get any user for issuedBy field
    const User = (await import('@/lib/models/User')).default;
    const anyUser = await User.findOne();
    if (!anyUser) {
      return NextResponse.json({ error: 'No user found. Please create a user first.' }, { status: 400 });
    }
    const userId = anyUser._id;

    const body = await request.json();
    const { bookingId, items, tax, discount, notes } = body;

    // Validation
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invoice items are required' }, { status: 400 });
    }

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('guestId')
      .populate('roomId')
      .lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Generate unique invoice number
    let invoiceNumber = generateInvoiceNumber();
    while (await Invoice.findOne({ invoiceNumber })) {
      invoiceNumber = generateInvoiceNumber();
    }

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      bookingId: new mongoose.Types.ObjectId(bookingId),
      guestId: new mongoose.Types.ObjectId((booking.guestId as any)._id || booking.guestId),
      roomId: new mongoose.Types.ObjectId((booking.roomId as any)._id || booking.roomId),
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      items: items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: 'pending',
      notes,
      issuedBy: userId,
    });

    try {
      await logAudit('Invoice', invoice._id, 'create', userId.toString());
    } catch (auditError) {
      console.warn('Audit log failed:', auditError);
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

