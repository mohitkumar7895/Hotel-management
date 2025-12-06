import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import { authenticateRequest, canView } from '@/lib/auth-utils';

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
      .populate('bookingId', 'checkIn checkOut')
      .populate('issuedBy', 'name email')
      .lean();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Return invoice data for PDF generation (client-side)
    // In production, you might want to use a library like pdfkit or puppeteer
    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Get invoice PDF error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice for PDF' },
      { status: 500 }
    );
  }
}

