'use server';

import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
// Authentication removed
import { hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff']).default('staff'),
  phone: z.string().optional(),
});

export async function createUser(formData: FormData) {
  try {
    // Authentication removed

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: (formData.get('role') as string) || 'staff',
      phone: formData.get('phone') as string,
    };

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
    // Authentication removed

    await connectDB();
    await User.findByIdAndDelete(id);

    revalidatePath('/users');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete user' };
  }
}


