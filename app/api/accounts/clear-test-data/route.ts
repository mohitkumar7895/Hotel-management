import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    console.log('🚀 Starting test data deletion...');

    // Import models
    const Invoice = (await import('@/lib/models/Invoice')).default;
    const Payment = (await import('@/lib/models/Payment')).default;
    const Vendor = (await import('@/lib/models/Vendor')).default;

    // Strategy: Delete ALL transactions that match test patterns
    // Multiple passes to catch all variations

    // Pass 1: Delete by description pattern (most common seed data pattern)
    const deleteByDescription = await Transaction.deleteMany({
      $or: [
        { description: { $regex: /service revenue/i } },
        { description: { $regex: /revenue entry/i } },
        { description: { $regex: /expense entry/i } },
      ],
    });
    console.log(`✅ Pass 1: Deleted ${deleteByDescription.deletedCount} by description pattern`);

    // Pass 2: Delete by lowercase category (seed data uses lowercase)
    const deleteByCategory = await Transaction.deleteMany({
      category: { $in: ['food', 'rooms', 'spa', 'laundry', 'other', 'room booking'] },
    });
    console.log(`✅ Pass 2: Deleted ${deleteByCategory.deletedCount} by lowercase category`);

    // Pass 3: Delete by payment mode (seed uses bank_transfer, form uses netbanking)
    const deleteByPaymentMode = await Transaction.deleteMany({
      paymentMode: 'bank_transfer',
    });
    console.log(`✅ Pass 3: Deleted ${deleteByPaymentMode.deletedCount} by payment mode`);

    // Pass 4: Delete empty descriptions (common in seed data)
    const deleteEmptyDesc = await Transaction.deleteMany({
      $or: [
        { description: { $exists: false } },
        { description: '' },
        { description: '-' },
      ],
    });
    console.log(`✅ Pass 4: Deleted ${deleteEmptyDesc.deletedCount} with empty descriptions`);

    // Also delete all invoices, payments, and vendors (seed data)
    const deleteInvoices = await Invoice.deleteMany({});
    const deletePayments = await Payment.deleteMany({});
    const deleteVendors = await Vendor.deleteMany({});

    console.log(`✅ Deleted ${deleteInvoices.deletedCount} invoices, ${deletePayments.deletedCount} payments, ${deleteVendors.deletedCount} vendors`);

    const totalDeleted = 
      deleteByDescription.deletedCount + 
      deleteByCategory.deletedCount + 
      deleteByPaymentMode.deletedCount + 
      deleteEmptyDesc.deletedCount +
      deleteInvoices.deletedCount +
      deletePayments.deletedCount +
      deleteVendors.deletedCount;

    console.log(`🎉 Total deleted: ${totalDeleted} entries`);

    return NextResponse.json({
      success: true,
      message: 'All test/seed data cleared successfully',
      deletedCount: totalDeleted,
      breakdown: {
        byDescription: deleteByDescription.deletedCount,
        byCategory: deleteByCategory.deletedCount,
        byPaymentMode: deleteByPaymentMode.deletedCount,
        byEmptyDesc: deleteEmptyDesc.deletedCount,
        invoices: deleteInvoices.deletedCount,
        payments: deletePayments.deletedCount,
        vendors: deleteVendors.deletedCount,
      },
    });
  } catch (error: any) {
    console.error('❌ Clear test data error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to clear test data',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Same as DELETE for easier access
  return DELETE(request);
}

