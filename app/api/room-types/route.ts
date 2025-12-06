import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RoomType from '@/lib/models/RoomType';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const roomTypes = await RoomType.find().sort({ name: 1 }).lean();
    return NextResponse.json({ roomTypes });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


