import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const guest = await Guest.findById(params.id)
      .populate('roomId', 'roomNumber')
      .lean();
    
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ guest });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

