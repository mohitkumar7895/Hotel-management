import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export const dynamic = 'force-dynamic';

// GET - Fetch settings (always returns one document, creates default if none exists)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        hotelName: 'Hotel Management System',
        taxRate: 10,
        currency: 'INR',
        address: '',
        phone: '',
        email: '',
        timezone: 'Asia/Kolkata',
        checkInTime: '14:00',
        checkOutTime: '11:00',
      });
      console.log('✅ Created default settings');
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings (upsert - update if exists, create if not)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      hotelName,
      taxRate,
      currency,
      address,
      phone,
      email,
      logo,
      timezone,
      checkInTime,
      checkOutTime,
    } = body;

    // Validation
    if (!hotelName || hotelName.trim() === '') {
      return NextResponse.json(
        { error: 'Hotel name is required' },
        { status: 400 }
      );
    }

    if (taxRate === undefined || taxRate === null || taxRate < 0 || taxRate > 100) {
      return NextResponse.json(
        { error: 'Tax rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      hotelName: hotelName.trim(),
      taxRate: parseFloat(taxRate),
      currency,
    };

    if (address !== undefined) updateData.address = address?.trim() || '';
    if (phone !== undefined) updateData.phone = phone?.trim() || '';
    if (email !== undefined) updateData.email = email?.trim().toLowerCase() || '';
    if (logo !== undefined) updateData.logo = logo?.trim() || '';
    if (timezone !== undefined) updateData.timezone = timezone || 'Asia/Kolkata';
    if (checkInTime !== undefined) updateData.checkInTime = checkInTime || '14:00';
    if (checkOutTime !== undefined) updateData.checkOutTime = checkOutTime || '11:00';

    console.log('💾 Saving settings to MongoDB Atlas:', {
      hotelName: updateData.hotelName,
      taxRate: updateData.taxRate,
      currency: updateData.currency,
    });

    // Upsert: update if exists, create if not
    // Find any existing settings document (there should only be one)
    let settings = await Settings.findOne();
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, updateData);
      await settings.save();
      console.log('✅ Updated existing settings in MongoDB Atlas:', settings._id);
    } else {
      // Create new settings
      settings = await Settings.create(updateData);
      console.log('✅ Created new settings in MongoDB Atlas:', settings._id);
    }

    return NextResponse.json({
      settings,
      message: 'Settings saved successfully in MongoDB Atlas',
    });
  } catch (error: any) {
    console.error('❌ Save settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

