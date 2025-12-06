import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import { authenticateRequest, canView, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Skip authentication check - allow access without auth
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const vendorId = searchParams.get('vendorId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { type: 'expense' };

    if (category) query.category = category;
    if (vendorId && vendorId.trim() !== '' && mongoose.Types.ObjectId.isValid(vendorId)) {
      query.vendorId = new mongoose.Types.ObjectId(vendorId);
    }
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
      .populate('vendorId', 'name contactPerson phone')
      .populate('createdBy', 'name email')
      .lean();

    const total = await Transaction.countDocuments(query);

    // Get categories for filter
    const categories = await Transaction.distinct('category', { type: 'expense' });

    // Get monthly expense data for charts
    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          ...(startDate || endDate
            ? {
                date: {
                  ...(startDate ? { $gte: new Date(startDate) } : {}),
                  ...(endDate ? { $lte: new Date(endDate) } : {}),
                },
              }
            : {}),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return NextResponse.json({
      transactions,
      categories,
      monthlyExpenses: monthlyExpenses.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.total,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get any user for createdBy field (skip authentication for now)
    let userId = null;
    const anyUser = await User.findOne();
    if (anyUser) {
      userId = anyUser._id;
    } else {
      return NextResponse.json({ error: 'No user found. Please create a user first.' }, { status: 400 });
    }

    const body = await request.json();
    const { category, amount, date, reference, paymentMode, description, vendorId } = body;

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

    // Validate and convert vendorId only if it's a valid non-empty string
    let vendorIdObj = undefined;
    if (vendorId && typeof vendorId === 'string' && vendorId.trim() !== '') {
      // Check if it's a valid ObjectId format (24 hex characters)
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        vendorIdObj = new mongoose.Types.ObjectId(vendorId);
      } else {
        console.warn(`Invalid vendorId format: ${vendorId}`);
      }
    }

    const transaction = await Transaction.create({
      type: 'expense',
      category,
      amount: parseFloat(amount),
      date: new Date(date),
      reference: reference && reference.trim() !== '' ? reference : undefined,
      paymentMode,
      description: description && description.trim() !== '' ? description : undefined,
      vendorId: vendorIdObj,
      createdBy: userId,
    });

    // Update vendor outstanding balance if vendor is specified
    if (vendorIdObj) {
      const Vendor = (await import('@/lib/models/Vendor')).default;
      const vendor = await Vendor.findById(vendorIdObj);
      if (vendor) {
        vendor.outstandingBalance = (vendor.outstandingBalance || 0) + parseFloat(amount);
        vendor.totalTransactions = (vendor.totalTransactions || 0) + 1;
        await vendor.save();
      }
    }

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
        vendorId: transactionObj.vendorId,
        message: 'Expense entry created successfully'
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create expense entry' },
      { status: 500 }
    );
  }
}

