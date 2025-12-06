import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canView, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';

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

    const vendor = await Vendor.findById(params.id).lean();
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Get payment history
    const transactions = await Transaction.find({ vendorId: params.id })
      .sort({ date: -1 })
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({
      vendor,
      transactions,
    });
  } catch (error: any) {
    console.error('Get vendor error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vendor' },
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

    const vendor = await Vendor.findById(params.id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const body = await request.json();
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (body.name !== undefined && body.name !== vendor.name) {
      changes.push({ field: 'name', oldValue: vendor.name, newValue: body.name });
      vendor.name = body.name;
    }
    if (body.contactPerson !== undefined && body.contactPerson !== vendor.contactPerson) {
      changes.push({
        field: 'contactPerson',
        oldValue: vendor.contactPerson,
        newValue: body.contactPerson,
      });
      vendor.contactPerson = body.contactPerson;
    }
    if (body.email !== undefined && body.email !== vendor.email) {
      changes.push({ field: 'email', oldValue: vendor.email, newValue: body.email });
      vendor.email = body.email;
    }
    if (body.phone !== undefined && body.phone !== vendor.phone) {
      changes.push({ field: 'phone', oldValue: vendor.phone, newValue: body.phone });
      vendor.phone = body.phone;
    }
    if (body.address !== undefined && body.address !== vendor.address) {
      changes.push({ field: 'address', oldValue: vendor.address, newValue: body.address });
      vendor.address = body.address;
    }
    if (body.gstNumber !== undefined && body.gstNumber !== vendor.gstNumber) {
      changes.push({
        field: 'gstNumber',
        oldValue: vendor.gstNumber,
        newValue: body.gstNumber,
      });
      vendor.gstNumber = body.gstNumber;
    }

    await vendor.save();

    for (const change of changes) {
      await logAudit('Vendor', vendor._id, 'update', user.userId, change.field, change.oldValue, change.newValue);
    }

    return NextResponse.json({ vendor });
  } catch (error: any) {
    console.error('Update vendor error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update vendor' },
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

    const vendor = await Vendor.findById(params.id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Check if vendor has transactions
    const transactionCount = await Transaction.countDocuments({ vendorId: params.id });
    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vendor with existing transactions' },
        { status: 400 }
      );
    }

    await logAudit('Vendor', vendor._id, 'delete', user.userId);
    await vendor.deleteOne();

    return NextResponse.json({ message: 'Vendor deleted successfully' });
  } catch (error: any) {
    console.error('Delete vendor error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}

