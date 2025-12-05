import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Authentication removed - return default user
    return NextResponse.json({ 
      user: {
        id: 'default',
        name: 'User',
        email: 'user@hotel.com',
        role: 'admin'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


