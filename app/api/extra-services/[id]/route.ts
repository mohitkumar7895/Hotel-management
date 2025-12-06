import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExtraService from '@/lib/models/ExtraService';

export const dynamic = 'force-dynamic';

// GET - Fetch single service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const service = await ExtraService.findById(params.id).lean();

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('Fetch service error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, category, price, unit, description, duration, isAvailable, requiresBooking, maxCapacity, icon, image } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (unit !== undefined) updateData.unit = unit;
    if (description !== undefined) updateData.description = description?.trim() || undefined;
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : undefined;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (requiresBooking !== undefined) updateData.requiresBooking = requiresBooking;
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity ? parseInt(maxCapacity) : undefined;
    if (icon !== undefined) updateData.icon = icon?.trim() || undefined;
    if (image !== undefined) updateData.image = image?.trim() || undefined;

    const service = await ExtraService.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      service,
      message: 'Service updated successfully'
    });
  } catch (error: any) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const service = await ExtraService.findByIdAndDelete(params.id);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Service deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
}

