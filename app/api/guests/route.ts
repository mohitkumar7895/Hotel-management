import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';

export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, phone, address, idProof } = body;

    if (!name || !email || !phone || !address || !idProof) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const guest = await Guest.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      idProof,
    });

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error: any) {
    console.error('Create guest error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Guest with this email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create guest' },
      { status: 500 }
    );
  }
}

