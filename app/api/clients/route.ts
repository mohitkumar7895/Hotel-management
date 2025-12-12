import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/lib/models/Client';
import { authenticateRequest, canView, canEdit } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const clients = await Client.find().sort({ name: 1 }).lean();

    return NextResponse.json({ clients });
  } catch (error: any) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, contactPerson, email, phone, address, website, logo, description } = body;

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone' },
        { status: 400 }
      );
    }

    const client = await Client.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      website,
      logo,
      description,
    });

    try {
      const User = (await import('@/lib/models/User')).default;
      const anyUser = await User.findOne();
      if (anyUser) {
        await logAudit('Client', client._id, 'create', anyUser._id.toString());
      }
    } catch (auditError) {
      console.warn('Audit log failed:', auditError);
    }

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 500 }
    );
  }
}

