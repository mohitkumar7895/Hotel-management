import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RoomType from '@/lib/models/RoomType';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const roomType = await RoomType.findById(params.id).lean();
    
    if (!roomType) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 });
    }

    return NextResponse.json({ roomType });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


