import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();

    const transaction = await Transaction.findById(params.id)
      .populate('bookingId')
      .populate('vendorId')
      .populate('createdBy', 'name email')
      .lean();

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('Get transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    await connectDB();

    const transaction = await Transaction.findById(params.id);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Track changes for audit
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (body.category !== undefined && body.category !== transaction.category) {
      changes.push({ field: 'category', oldValue: transaction.category, newValue: body.category });
      updates.category = body.category;
    }
    if (body.amount !== undefined && body.amount !== transaction.amount) {
      changes.push({ field: 'amount', oldValue: transaction.amount, newValue: body.amount });
      updates.amount = body.amount;
    }
    if (body.date !== undefined) {
      const newDate = new Date(body.date);
      if (newDate.getTime() !== transaction.date.getTime()) {
        changes.push({ field: 'date', oldValue: transaction.date, newValue: newDate });
        updates.date = newDate;
      }
    }
    if (body.paymentMode !== undefined && body.paymentMode !== transaction.paymentMode) {
      changes.push({
        field: 'paymentMode',
        oldValue: transaction.paymentMode,
        newValue: body.paymentMode,
      });
      updates.paymentMode = body.paymentMode;
    }
    if (body.description !== undefined) {
      updates.description = body.description;
    }
    if (body.reference !== undefined) {
      updates.reference = body.reference;
    }

    Object.assign(transaction, updates);
    await transaction.save();

    // Log audit for each change
    for (const change of changes) {
      await logAudit('Transaction', transaction._id, 'update', user.userId, change.field, change.oldValue, change.newValue);
    }

    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await connectDB();

    const transaction = await Transaction.findById(params.id);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await logAudit('Transaction', transaction._id, 'delete', user.userId);
    await transaction.deleteOne();

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

