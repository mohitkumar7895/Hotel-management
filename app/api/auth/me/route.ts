import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('hotel-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();
    // Only select needed fields for faster queries
    const user = await User.findById(payload.userId).select('name email role phone profileImage createdAt').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Ensure name is always a string (use email prefix if name is missing)
    const displayName = user.name && user.name.trim() 
      ? user.name.trim() 
      : user.email.split('@')[0];

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: displayName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

