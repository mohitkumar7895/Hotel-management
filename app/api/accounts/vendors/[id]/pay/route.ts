import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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
    const { amount, paymentMode, reference, description } = body;

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

    const vendor = await Vendor.findById(params.id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (amount > vendor.outstandingBalance) {
      return NextResponse.json(
        { error: 'Payment amount cannot exceed outstanding balance' },
        { status: 400 }
      );
    }

    // Create expense transaction for payment
    const transaction = await Transaction.create({
      type: 'expense',
      category: 'Vendor Payments',
      amount,
      date: new Date(),
      reference,
      paymentMode,
      description: description || `Payment to ${vendor.name}`,
      vendorId: new mongoose.Types.ObjectId(params.id),
      createdBy: new mongoose.Types.ObjectId(user.userId),
    });

    // Update vendor balance
    vendor.outstandingBalance = Math.max(0, vendor.outstandingBalance - amount);
    vendor.totalPaid = (vendor.totalPaid || 0) + amount;
    await vendor.save();

    await logAudit('Transaction', transaction._id, 'create', user.userId);

    return NextResponse.json({
      transaction,
      vendor,
      message: 'Payment recorded successfully',
    });
  } catch (error: any) {
    console.error('Record vendor payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}

