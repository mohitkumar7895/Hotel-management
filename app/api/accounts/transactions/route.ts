import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canView, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    if (!canView(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('bookingId', 'guestId roomId')
      .populate('vendorId', 'name')
      .populate('createdBy', 'name email')
      .lean();

    const total = await Transaction.countDocuments(query);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    if (!canEdit(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { type, category, amount, date, reference, paymentMode, description, bookingId, vendorId } =
      body;

    // Validation
    if (!type || !category || !amount || !date || !paymentMode) {
      return NextResponse.json(
        { error: 'Missing required fields: type, category, amount, date, paymentMode' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    await connectDB();

    const transaction = await Transaction.create({
      type,
      category,
      amount,
      date: new Date(date),
      reference,
      paymentMode,
      description,
      bookingId: bookingId ? new mongoose.Types.ObjectId(bookingId) : undefined,
      vendorId: vendorId ? new mongoose.Types.ObjectId(vendorId) : undefined,
      createdBy: new mongoose.Types.ObjectId(user.userId),
    });

    await logAudit('Transaction', transaction._id, 'create', user.userId);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

