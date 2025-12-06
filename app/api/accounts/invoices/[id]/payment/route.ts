import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import Payment from '@/lib/models/Payment';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    if (!canEdit(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, paymentMode, reference, notes } = body;

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

    await connectDB();

    const invoice = await Invoice.findById(params.id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (amount > invoice.dueAmount) {
      return NextResponse.json(
        { error: 'Payment amount cannot exceed due amount' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await Payment.create({
      invoiceId: new mongoose.Types.ObjectId(params.id),
      amount,
      paymentMode,
      paymentDate: new Date(),
      reference,
      notes,
      receivedBy: new mongoose.Types.ObjectId(user.userId),
    });

    // Update invoice
    invoice.paidAmount = (invoice.paidAmount || 0) + amount;
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

    // Create revenue transaction
    const transaction = await Transaction.create({
      type: 'revenue',
      category: 'Room Booking',
      amount,
      date: new Date(),
      reference: invoice.invoiceNumber,
      paymentMode,
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      invoiceId: new mongoose.Types.ObjectId(params.id),
      bookingId: invoice.bookingId,
      createdBy: new mongoose.Types.ObjectId(user.userId),
    });

    await logAudit('Payment', payment._id, 'create', user.userId);
    await logAudit('Invoice', invoice._id, 'update', user.userId, 'paidAmount', invoice.paidAmount - amount, invoice.paidAmount);

    return NextResponse.json({
      payment,
      invoice,
      transaction,
      message: 'Payment recorded successfully',
    });
  } catch (error: any) {
    console.error('Record payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}

