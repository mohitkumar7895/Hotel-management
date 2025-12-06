import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('hotel-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Check if request contains FormData (file upload)
    // When using FormData, browser sets content-type with boundary
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data') || contentType.includes('boundary');
    
    // Try to get formData first to check if it's FormData
    let formData: FormData | null = null;
    try {
      formData = await request.formData();
    } catch (e) {
      // Not FormData, will handle as JSON
    }
    
    if (formData && (isFormData || formData.has('profileImage'))) {
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string | null;
      const file = formData.get('profileImage') as File | null;

      // Validate basic fields
      const validatedData = profileSchema.parse({
        name,
        email,
        phone: phone || undefined,
      });

      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: validatedData.email,
        _id: { $ne: payload.userId },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }

      let profileImageUrl = undefined;

      // Handle file upload
      if (file && file.size > 0) {
        try {
          console.log('Processing file upload:', file.name, file.size, file.type);
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `profile-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');

          // Ensure upload directory exists
          await mkdir(uploadDir, { recursive: true });

          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, buffer);
          profileImageUrl = `/uploads/profiles/${filename}`;
          console.log('Profile image saved successfully:', profileImageUrl);
          console.log('File path:', filePath);
        } catch (uploadError: any) {
          console.error('Error uploading profile image:', uploadError);
          return NextResponse.json(
            { error: 'Failed to upload profile image: ' + (uploadError.message || 'Unknown error') },
            { status: 500 }
          );
        }
      } else {
        console.log('No file provided or file size is 0');
      }

      const updateData: any = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
      };

      if (profileImageUrl) {
        updateData.profileImage = profileImageUrl;
      }

      console.log('Updating user with data:', updateData);
      
      // Save to MongoDB Atlas
      const user = await User.findByIdAndUpdate(
        payload.userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      console.log('User updated in MongoDB, profileImage saved:', user.profileImage);
      console.log('User document:', JSON.stringify(user.toObject(), null, 2));

      return NextResponse.json({
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage || undefined,
        },
      });
    } else {
      // Handle JSON request (backward compatibility)
      const body = await request.json();
      const validatedData = profileSchema.parse(body);

      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: validatedData.email,
        _id: { $ne: payload.userId },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }

      const updateData: any = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
      };

      if (validatedData.profileImage) {
        updateData.profileImage = validatedData.profileImage;
      }

      const user = await User.findByIdAndUpdate(
        payload.userId,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
        },
      });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

