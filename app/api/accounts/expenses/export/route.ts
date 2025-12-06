import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Skip authentication check - allow access without auth
    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const vendorId = searchParams.get('vendorId');

    const query: any = { type: 'expense' };

    if (category) query.category = category;
    if (vendorId) {
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose.Types.ObjectId(vendorId);
      }
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
      .populate('vendorId', 'name')
      .lean();

    if (format === 'csv') {
      // Generate CSV with proper formatting
      const headers = ['Date', 'Category', 'Amount (₹)', 'Payment Mode', 'Vendor', 'Reference', 'Description'];
      
      const rows = transactions.map((t) => [
        new Date(t.date).toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }),
        t.category || '',
        `₹${parseFloat(t.amount.toString()).toFixed(2)}`,
        (t.paymentMode || '').charAt(0).toUpperCase() + (t.paymentMode || '').slice(1),
        (t.vendorId as any)?.name || '',
        t.reference || '',
        (t.description || '').replace(/"/g, '""'), // Escape quotes in CSV
      ]);

      // Create CSV with proper escaping
      const csvRows = [
        headers.join(','),
        ...rows.map((row) => 
          row.map((cell) => {
            // Escape commas, quotes, and newlines
            const cellStr = String(cell || '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        ),
      ];

      const csv = csvRows.join('\n');

      // Add BOM for Excel compatibility (UTF-8)
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csv;

      return new NextResponse(csvWithBOM, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="expenses-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Return JSON for PDF generation (client-side)
      return NextResponse.json({ transactions });
    }
  } catch (error: any) {
    console.error('Export expenses error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export expenses' },
      { status: 500 }
    );
  }
}

