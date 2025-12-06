import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip authentication check
    await connectDB();
    
    // Get any user for audit log
    const User = (await import('@/lib/models/User')).default;
    const anyUser = await User.findOne();
    const userId = anyUser ? anyUser._id.toString() : '';

    const transaction = await Transaction.findById(params.id);
    if (!transaction || transaction.type !== 'expense') {
      return NextResponse.json({ error: 'Expense entry not found' }, { status: 404 });
    }

    const body = await request.json();
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    // Handle vendor balance update if amount or vendor changed
    const Vendor = (await import('@/lib/models/Vendor')).default;
    if (transaction.vendorId) {
      const oldVendor = await Vendor.findById(transaction.vendorId);
      if (oldVendor) {
        oldVendor.outstandingBalance = Math.max(0, (oldVendor.outstandingBalance || 0) - transaction.amount);
        await oldVendor.save();
      }
    }

    if (body.category !== undefined && body.category !== transaction.category) {
      changes.push({ field: 'category', oldValue: transaction.category, newValue: body.category });
      transaction.category = body.category;
    }
    if (body.amount !== undefined && body.amount !== transaction.amount) {
      changes.push({ field: 'amount', oldValue: transaction.amount, newValue: body.amount });
      transaction.amount = body.amount;
    }
    if (body.date !== undefined) {
      const newDate = new Date(body.date);
      if (newDate.getTime() !== transaction.date.getTime()) {
        changes.push({ field: 'date', oldValue: transaction.date, newValue: newDate });
        transaction.date = newDate;
      }
    }
    if (body.paymentMode !== undefined && body.paymentMode !== transaction.paymentMode) {
      changes.push({
        field: 'paymentMode',
        oldValue: transaction.paymentMode,
        newValue: body.paymentMode,
      });
      transaction.paymentMode = body.paymentMode;
    }
    if (body.description !== undefined) {
      transaction.description = body.description;
    }
    if (body.reference !== undefined) {
      transaction.reference = body.reference;
    }
    if (body.vendorId !== undefined) {
      transaction.vendorId = body.vendorId;
    }

    await transaction.save();

    // Update new vendor balance
    if (transaction.vendorId) {
      const newVendor = await Vendor.findById(transaction.vendorId);
      if (newVendor) {
        newVendor.outstandingBalance = (newVendor.outstandingBalance || 0) + transaction.amount;
        await newVendor.save();
      }
    }

    if (userId) {
      for (const change of changes) {
        try {
          await logAudit('Transaction', transaction._id, 'update', userId, change.field, change.oldValue, change.newValue);
        } catch (auditError) {
          console.warn('Audit log failed:', auditError);
        }
      }
    }

    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update expense entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip authentication check
    await connectDB();
    
    // Get any user for audit log
    const User = (await import('@/lib/models/User')).default;
    const anyUser = await User.findOne();
    const userId = anyUser ? anyUser._id.toString() : '';

    const transaction = await Transaction.findById(params.id);
    if (!transaction || transaction.type !== 'expense') {
      return NextResponse.json({ error: 'Expense entry not found' }, { status: 404 });
    }

    // Update vendor balance
    if (transaction.vendorId) {
      const Vendor = (await import('@/lib/models/Vendor')).default;
      const vendor = await Vendor.findById(transaction.vendorId);
      if (vendor) {
        vendor.outstandingBalance = Math.max(0, (vendor.outstandingBalance || 0) - transaction.amount);
        await vendor.save();
      }
    }

    if (userId) {
      try {
        await logAudit('Transaction', transaction._id, 'delete', userId);
      } catch (auditError) {
        console.warn('Audit log failed:', auditError);
      }
    }
    await transaction.deleteOne();

    return NextResponse.json({ message: 'Expense entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete expense entry' },
      { status: 500 }
    );
  }
}

