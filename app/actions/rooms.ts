'use server';

import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Room from '@/lib/models/Room';
// Authentication removed
import { revalidatePath } from 'next/cache';

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  roomTypeId: z.string().min(1, 'Room type is required').refine((val) => {
    // Check if it's a valid MongoDB ObjectId format
    return /^[0-9a-fA-F]{24}$/.test(val);
  }, {
    message: 'Invalid room type ID',
  }),
  floor: z.number().min(0, 'Floor must be non-negative'),
  status: z.enum(['available', 'booked', 'cleaning', 'maintenance']).default('available'),
});

export async function createRoom(formData: FormData) {
  try {
    // Authentication removed

    const rawData = {
      roomNumber: formData.get('roomNumber') as string,
      roomTypeId: formData.get('roomTypeId') as string,
      floor: parseInt(formData.get('floor') as string),
      status: (formData.get('status') as string) || 'available',
    };

    const validatedData = roomSchema.parse(rawData);

    await connectDB();
    const room = await Room.create(validatedData);

    revalidatePath('/rooms');
    return { success: true, room };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    if (error.code === 11000) {
      return { error: 'Room number already exists' };
    }
    return { error: error.message || 'Failed to create room' };
  }
}

export async function updateRoom(id: string, formData: FormData) {
  try {
    // Authentication removed

    const rawData = {
      roomNumber: formData.get('roomNumber') as string,
      roomTypeId: formData.get('roomTypeId') as string,
      floor: parseInt(formData.get('floor') as string),
      status: formData.get('status') as string,
    };

    const validatedData = roomSchema.parse(rawData);

    await connectDB();
    const room = await Room.findByIdAndUpdate(id, validatedData, { new: true });

    if (!room) {
      return { error: 'Room not found' };
    }

    revalidatePath('/rooms');
    return { success: true, room };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to update room' };
  }
}

export async function updateRoomStatus(id: string, status: string) {
  try {
    // Authentication removed

    await connectDB();
    const room = await Room.findByIdAndUpdate(id, { status }, { new: true });

    if (!room) {
      return { error: 'Room not found' };
    }

    revalidatePath('/rooms');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update room status' };
  }
}

export async function deleteRoom(id: string) {
  try {
    // Authentication removed

    await connectDB();
    await Room.findByIdAndDelete(id);

    revalidatePath('/rooms');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete room' };
  }
}


