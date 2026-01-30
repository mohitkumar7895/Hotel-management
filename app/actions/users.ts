'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { revalidatePath } from 'next/cache';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff', 'accountant', 'manager']).default('staff'),
  phone: z.string().optional(),
});

async function checkSuperadmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hotel-token')?.value;
  
  if (!token) {
    return { error: 'Not authenticated' };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { error: 'Invalid token' };
  }

  await connectDB();
  const user = await User.findById(payload.userId).lean();
  
  if (!user || user.email !== 'superadmin@gmail.com') {
    return { error: 'Only superadmin can perform this action' };
  }

  return { success: true };
}

export async function createUser(formData: FormData) {
  try {
    // Check if user is superadmin
    const authCheck = await checkSuperadmin();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: (formData.get('role') as string) || 'staff',
      phone: formData.get('phone') as string,
    };

    // Prevent creating superadmin
    if (rawData.email.toLowerCase() === 'superadmin@gmail.com' || rawData.role === 'superadmin') {
      return { error: 'Cannot create superadmin account' };
    }

    const validatedData = userSchema.parse(rawData);

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return { error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = await User.create({
      ...validatedData,
      password: hashedPassword,
    });

    revalidatePath('/users');
    return { success: true, user: newUser };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to create user' };
  }
}

export async function deleteUser(id: string) {
  try {
    // Check if user is superadmin
    const authCheck = await checkSuperadmin();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    await connectDB();
    
    // Prevent deleting superadmin
    const userToDelete = await User.findById(id);
    if (userToDelete && userToDelete.email === 'superadmin@gmail.com') {
      return { error: 'Cannot delete superadmin account' };
    }

    await User.findByIdAndDelete(id);

    revalidatePath('/users');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete user' };
  }
}


