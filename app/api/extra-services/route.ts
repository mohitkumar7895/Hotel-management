import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExtraService from '@/lib/models/ExtraService';
import User from '@/lib/models/User';

// GET - Fetch all extra services with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search');

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (isAvailable !== null && isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await ExtraService.find(query)
      .sort({ category: 1, name: 1 })
      .lean();

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Fetch services error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create new extra service
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get any user for createdBy (skip authentication for development)
    let userId = null;
    const anyUser = await User.findOne();
    if (anyUser) {
      userId = anyUser._id;
    }

    const body = await request.json();
    const { name, category, price, unit, description, duration, isAvailable, requiresBooking, maxCapacity, icon, image } = body;

    // Validation
    if (!name || !category || price === undefined || price < 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, price' },
        { status: 400 }
      );
    }

    const service = await ExtraService.create({
      name: name.trim(),
      category,
      price: parseFloat(price),
      unit: unit || 'fixed',
      description: description?.trim() || undefined,
      duration: duration ? parseInt(duration) : undefined,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      requiresBooking: requiresBooking !== undefined ? requiresBooking : false,
      maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
      icon: icon?.trim() || undefined,
      image: image?.trim() || undefined,
    });

    return NextResponse.json({ 
      service,
      message: 'Service created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}

