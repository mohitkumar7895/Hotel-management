import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/lib/models/Room';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Only select needed fields for dashboard performance
    const rooms = await Room.find()
      .select('roomNumber status roomTypeId')
      .populate('roomTypeId', 'name price')
      .sort({ roomNumber: 1 })
      .lean();
    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

