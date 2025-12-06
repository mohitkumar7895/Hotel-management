import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const guests = await Guest.find()
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ guests });
  } catch (error: any) {
    console.error('Fetch guests error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

