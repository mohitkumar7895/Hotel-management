import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const superadminEmail = 'superadmin@gmail.com';
    const superadminPassword = '123456';

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ email: superadminEmail });
    
    if (existingSuperadmin) {
      // Update password if exists
      const hashedPassword = await hashPassword(superadminPassword);
      existingSuperadmin.password = hashedPassword;
      existingSuperadmin.role = 'superadmin';
      await existingSuperadmin.save();
      
      return NextResponse.json({
        success: true,
        message: 'Superadmin already exists. Password updated.',
      });
    }

    // Create superadmin
    const hashedPassword = await hashPassword(superadminPassword);
    await User.create({
      email: superadminEmail,
      password: hashedPassword,
      role: 'superadmin',
      name: 'Super Admin',
    });

    return NextResponse.json({
      success: true,
      message: 'Superadmin created successfully',
    });
  } catch (error: any) {
    console.error('Superadmin init error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize superadmin' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy initialization
export async function GET() {
  try {
    await connectDB();

    const superadminEmail = 'superadmin@gmail.com';
    const superadminPassword = '123456';

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ email: superadminEmail });
    
    if (existingSuperadmin) {
      // Update password if exists
      const hashedPassword = await hashPassword(superadminPassword);
      existingSuperadmin.password = hashedPassword;
      existingSuperadmin.role = 'superadmin';
      await existingSuperadmin.save();
      
      return NextResponse.json({
        success: true,
        message: 'Superadmin already exists. Password updated.',
      });
    }

    // Create superadmin
    const hashedPassword = await hashPassword(superadminPassword);
    await User.create({
      email: superadminEmail,
      password: hashedPassword,
      role: 'superadmin',
      name: 'Super Admin',
    });

    return NextResponse.json({
      success: true,
      message: 'Superadmin created successfully',
    });
  } catch (error: any) {
    console.error('Superadmin init error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize superadmin' },
      { status: 500 }
    );
  }
}
