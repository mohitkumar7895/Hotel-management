import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import { authorizeRoles } from '@/lib/middleware/auth';
import { logAudit } from '@/lib/audit-log';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Allow: superadmin, admin, accountant (view revenue)
    const authResult = await authorizeRoles('superadmin', 'admin', 'accountant')(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { type: 'revenue' };

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
      .populate('bookingId', 'guestId roomId checkIn checkOut')
      .populate('createdBy', 'name email')
      .lean();

    const total = await Transaction.countDocuments(query);

    // Get categories for filter
    const categories = await Transaction.distinct('category', { type: 'revenue' });

    return NextResponse.json({
      transactions,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get revenue error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Allow: superadmin, admin, accountant (create revenue)
    const authResult = await authorizeRoles('superadmin', 'admin', 'accountant')(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();
    
    // Get any user for createdBy field
    let userId = null;
    const anyUser = await User.findOne();
    if (anyUser) {
      userId = anyUser._id;
    } else {
      return NextResponse.json({ error: 'No user found. Please create a user first.' }, { status: 400 });
    }

    const body = await request.json();
    const { category, amount, date, reference, paymentMode, description, bookingId } = body;

    // Validation
    if (!category || !amount || !date || !paymentMode) {
      return NextResponse.json(
        { error: 'Missing required fields: category, amount, date, paymentMode' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Validate and convert bookingId only if it's a valid non-empty string
    let bookingIdObj = undefined;
    if (bookingId && typeof bookingId === 'string' && bookingId.trim() !== '') {
      // Check if it's a valid ObjectId format (24 hex characters)
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        bookingIdObj = new mongoose.Types.ObjectId(bookingId);
      } else {
        console.warn(`Invalid bookingId format: ${bookingId}`);
      }
    }

    const transaction = await Transaction.create({
      type: 'revenue',
      category,
      amount: parseFloat(amount),
      date: new Date(date),
      reference: reference && reference.trim() !== '' ? reference : undefined,
      paymentMode,
      description: description && description.trim() !== '' ? description : undefined,
      bookingId: bookingIdObj,
      createdBy: userId,
    });

    // Log audit if possible
    try {
      await logAudit('Transaction', transaction._id, 'create', userId.toString());
    } catch (auditError) {
      // Ignore audit errors
      console.warn('Audit log failed:', auditError);
    }

    // Return the created transaction with proper formatting
    const transactionObj = transaction.toObject();
    return NextResponse.json({ 
      transaction: {
        _id: transactionObj._id,
        type: transactionObj.type,
        category: transactionObj.category,
        amount: transactionObj.amount,
        date: transactionObj.date,
        paymentMode: transactionObj.paymentMode,
        description: transactionObj.description,
        reference: transactionObj.reference,
        message: 'Revenue entry created successfully'
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create revenue error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create revenue entry' },
      { status: 500 }
    );
  }
}

