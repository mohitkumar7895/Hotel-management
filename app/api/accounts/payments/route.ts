import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import Invoice from '@/lib/models/Invoice';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Get all payments with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentMode = searchParams.get('paymentMode');
    const invoiceId = searchParams.get('invoiceId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};

    if (invoiceId && mongoose.Types.ObjectId.isValid(invoiceId)) {
      query.invoiceId = new mongoose.Types.ObjectId(invoiceId);
    }
    if (paymentMode) query.paymentMode = paymentMode;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    const payments = await Payment.find(query)
      .sort({ paymentDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('invoiceId', 'invoiceNumber guestName totalAmount paidAmount dueAmount')
      .populate('receivedBy', 'name email')
      .lean();

    const total = await Payment.countDocuments(query);

    // Get payment statistics
    const stats = await Payment.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          byMode: {
            $push: {
              mode: '$paymentMode',
              amount: '$amount',
            },
          },
        },
      },
    ]);

    const paymentByMode: { [key: string]: number } = {};
    if (stats[0]?.byMode) {
      stats[0].byMode.forEach((item: any) => {
        paymentByMode[item.mode] = (paymentByMode[item.mode] || 0) + item.amount;
      });
    }

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalAmount: stats[0]?.totalAmount || 0,
        totalCount: stats[0]?.count || 0,
        byMode: paymentByMode,
      },
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// Create a new payment (quick payment recording)
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB Atlas (not localhost)
    await connectDB();
    
    // Verify we're connected to MongoDB Atlas
    const connection = mongoose.connection;
    if (connection.host === 'localhost' || connection.host === '127.0.0.1') {
      console.error('❌ ERROR: Connected to localhost instead of MongoDB Atlas!');
      return NextResponse.json(
        { error: 'Database connection error: Please use MongoDB Atlas, not localhost' },
        { status: 500 }
      );
    }
    console.log(`✅ Verified MongoDB Atlas connection: ${connection.host} | ${connection.db?.databaseName}`);

    // Get any user for receivedBy field
    let userId = null;
    const anyUser = await User.findOne();
    if (anyUser) {
      userId = anyUser._id;
    } else {
      return NextResponse.json({ error: 'No user found. Please create a user first.' }, { status: 400 });
    }

    const body = await request.json();
    const { invoiceId, amount, paymentMode, reference, notes } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }

    if (!paymentMode) {
      return NextResponse.json(
        { error: 'Payment mode is required' },
        { status: 400 }
      );
    }

    // If invoiceId is provided, validate and update invoice
    let invoice = null;
    if (invoiceId && mongoose.Types.ObjectId.isValid(invoiceId)) {
      invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      if (amount > invoice.dueAmount) {
        return NextResponse.json(
          { error: 'Payment amount cannot exceed due amount' },
          { status: 400 }
        );
      }
    }

    // Create payment record (invoiceId is optional)
    // Build payment data - DO NOT include invoiceId if not provided (let Mongoose use default)
    const paymentData: any = {
      amount: parseFloat(amount),
      paymentMode,
      paymentDate: new Date(),
      receivedBy: userId,
    };

    // Only add invoiceId to the object if it's provided and valid
    // If not provided, don't include it at all - Mongoose will use the default (null)
    if (invoiceId && typeof invoiceId === 'string' && invoiceId.trim() !== '' && mongoose.Types.ObjectId.isValid(invoiceId.trim())) {
      paymentData.invoiceId = new mongoose.Types.ObjectId(invoiceId.trim());
    }
    // If invoiceId is not provided, we don't add it to paymentData at all
    // The schema has default: null and required: false, so Mongoose will handle it

    // Add optional fields only if they have values
    if (reference && typeof reference === 'string' && reference.trim() !== '') {
      paymentData.reference = reference.trim();
    }
    if (notes && typeof notes === 'string' && notes.trim() !== '') {
      paymentData.notes = notes.trim();
    }

    console.log('💳 Creating payment with data:', {
      amount: paymentData.amount,
      paymentMode: paymentData.paymentMode,
      hasInvoiceId: 'invoiceId' in paymentData,
      invoiceId: paymentData.invoiceId ? paymentData.invoiceId.toString() : 'not included (direct payment)',
      reference: paymentData.reference || 'none',
    });

    // Create payment - use create() method
    // If invoiceId is not in paymentData, Mongoose will not validate it
    let payment;
    try {
      payment = await Payment.create(paymentData);
      console.log('✅ Payment created successfully in MongoDB Atlas:', payment._id);
    } catch (createError: any) {
      console.error('❌ Payment creation error:', createError);
      // If it's a validation error about invoiceId, try without it
      if (createError.message && createError.message.includes('invoiceId') && createError.message.includes('required')) {
        console.log('⚠️ Retrying payment creation without invoiceId field...');
        // Remove invoiceId completely and try again
        const paymentDataWithoutInvoice = { ...paymentData };
        delete paymentDataWithoutInvoice.invoiceId;
        payment = await Payment.create(paymentDataWithoutInvoice);
        console.log('✅ Payment created successfully (without invoiceId) in MongoDB Atlas:', payment._id);
      } else {
        throw createError;
      }
    }

    // Update invoice if provided
    if (invoice) {
      invoice.paidAmount = (invoice.paidAmount || 0) + parseFloat(amount);
      invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;

      if (invoice.paidAmount >= invoice.totalAmount) {
        invoice.paymentStatus = 'paid';
      } else if (invoice.paidAmount > 0) {
        invoice.paymentStatus = 'partial';
      }

      if (!invoice.paymentMode) {
        invoice.paymentMode = paymentMode;
      }

      await invoice.save();
    }

    // Create revenue transaction
    const transaction = await Transaction.create({
      type: 'revenue',
      category: invoice ? 'Room Booking' : 'Others',
      amount: parseFloat(amount),
      date: new Date(),
      reference: reference || (invoice ? invoice.invoiceNumber : undefined),
      paymentMode,
      description: invoice 
        ? `Payment for invoice ${invoice.invoiceNumber}` 
        : (notes || 'Payment received'),
      invoiceId: invoiceId && mongoose.Types.ObjectId.isValid(invoiceId) 
        ? new mongoose.Types.ObjectId(invoiceId) 
        : undefined,
      bookingId: invoice?.bookingId,
      createdBy: userId,
    });

    return NextResponse.json({
      payment,
      invoice,
      transaction,
      message: 'Payment recorded successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}

