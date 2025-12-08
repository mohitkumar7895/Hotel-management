import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/lib/models/Room';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Only select needed fields for dashboard performance - no populate needed for status counts
    const rooms = await Room.find()
      .select('roomNumber status')
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

