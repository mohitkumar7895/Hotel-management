import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/lib/models/Room';
import { authorizeRoles } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Allow: superadmin, admin, manager, staff, accountant (view only)
    const authResult = await authorizeRoles('superadmin', 'admin', 'manager', 'staff', 'accountant', 'USER')(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const roomTypeId = searchParams.get('roomTypeId');
    const status = searchParams.get('status');

    let query: any = {};
    if (roomTypeId) {
      query.roomTypeId = roomTypeId;
    }
    if (status) {
      query.status = status;
    }

    // Only select needed fields for dashboard performance - no populate needed for status counts
    const rooms = await Room.find(query)
      .populate('roomTypeId', 'name price')
      .select('roomNumber status roomTypeId')
      .sort({ roomNumber: 1 })
      .lean();
    
    return NextResponse.json({ rooms }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Rooms API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

