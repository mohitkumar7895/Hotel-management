import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
import Transaction from '@/lib/models/Transaction';
import { authenticateRequest, canView, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Skip authentication check - allow access without auth
    await connectDB();

    const vendors = await Vendor.find().sort({ name: 1 }).lean();

    // Get payment history for each vendor
    const vendorsWithHistory = await Promise.all(
      vendors.map(async (vendor) => {
        const transactions = await Transaction.find({
          vendorId: vendor._id,
        })
          .sort({ date: -1 })
          .limit(10)
          .lean();

        return {
          ...vendor,
          recentTransactions: transactions,
        };
      })
    );

    return NextResponse.json({ vendors: vendorsWithHistory });
  } catch (error: any) {
    console.error('Get vendors error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Skip authentication check
    await connectDB();

    const body = await request.json();
    const { name, contactPerson, email, phone, address, gstNumber } = body;

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone' },
        { status: 400 }
      );
    }

    const vendor = await Vendor.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      gstNumber,
      outstandingBalance: 0,
      totalPaid: 0,
      totalTransactions: 0,
    });

    try {
      const User = (await import('@/lib/models/User')).default;
      const anyUser = await User.findOne();
      if (anyUser) {
        await logAudit('Vendor', vendor._id, 'create', anyUser._id.toString());
      }
    } catch (auditError) {
      console.warn('Audit log failed:', auditError);
    }

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error: any) {
    console.error('Create vendor error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

