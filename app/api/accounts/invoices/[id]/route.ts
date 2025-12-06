import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import { authenticateRequest, canView, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    if (!canView(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const invoice = await Invoice.findById(params.id)
      .populate('guestId', 'name email phone address')
      .populate('roomId', 'roomNumber')
      .populate('bookingId', 'checkIn checkOut status')
      .populate('issuedBy', 'name email')
      .lean();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get payment history
    const Payment = (await import('@/lib/models/Payment')).default;
    const payments = await Payment.find({ invoiceId: params.id })
      .sort({ paymentDate: -1 })
      .populate('receivedBy', 'name email')
      .lean();

    return NextResponse.json({
      invoice,
      payments,
    });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice' },
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

    const invoice = await Invoice.findById(params.id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const body = await request.json();
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    // Only allow updating items, tax, discount, notes
    if (body.items !== undefined) {
      const subtotal = body.items.reduce((sum: number, item: any) => sum + item.amount, 0);
      const taxAmount = invoice.tax;
      const discountAmount = invoice.discount;
      const totalAmount = subtotal + taxAmount - discountAmount;

      changes.push({ field: 'items', oldValue: invoice.items, newValue: body.items });
      invoice.items = body.items;
      invoice.subtotal = subtotal;
      invoice.totalAmount = totalAmount;
      invoice.dueAmount = totalAmount - invoice.paidAmount;
    }

    if (body.tax !== undefined && body.tax !== invoice.tax) {
      changes.push({ field: 'tax', oldValue: invoice.tax, newValue: body.tax });
      invoice.tax = body.tax;
      invoice.totalAmount = invoice.subtotal + invoice.tax - invoice.discount;
      invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;
    }

    if (body.discount !== undefined && body.discount !== invoice.discount) {
      changes.push({
        field: 'discount',
        oldValue: invoice.discount,
        newValue: body.discount,
      });
      invoice.discount = body.discount;
      invoice.totalAmount = invoice.subtotal + invoice.tax - invoice.discount;
      invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;
    }

    if (body.notes !== undefined) {
      invoice.notes = body.notes;
    }

    // Update payment status
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.paymentStatus = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.paymentStatus = 'partial';
    } else {
      invoice.paymentStatus = 'pending';
    }

    await invoice.save();

    for (const change of changes) {
      await logAudit('Invoice', invoice._id, 'update', user.userId, change.field, change.oldValue, change.newValue);
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

