'use server';

import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import RoomType from '@/lib/models/RoomType';
// Authentication removed
import { revalidatePath } from 'next/cache';

const roomTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  amenities: z.array(z.string()).default([]),
  maxGuests: z.number().min(1, 'Max guests must be at least 1'),
  image: z.string().optional(),
});

export async function createRoomType(formData: FormData) {
  try {
    // Authentication removed

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const amenitiesStr = formData.get('amenities') as string;
    const maxGuestsStr = formData.get('maxGuests') as string;
    const image = formData.get('image') as string;

    // Validate required fields
    if (!name || name.trim() === '') {
      return { error: 'Room type name is required' };
    }
    if (!description || description.trim() === '') {
      return { error: 'Description is required' };
    }

    const price = parseFloat(priceStr || '0');
    if (isNaN(price) || price < 0) {
      return { error: 'Price must be a valid positive number' };
    }

    const maxGuests = parseInt(maxGuestsStr || '1');
    if (isNaN(maxGuests) || maxGuests < 1) {
      return { error: 'Max guests must be at least 1' };
    }

    // Process amenities
    let amenities: string[] = [];
    if (amenitiesStr && amenitiesStr.trim() !== '') {
      amenities = amenitiesStr.split(',').map((a) => a.trim()).filter((a) => a !== '');
    }

    const rawData = {
      name: name.trim(),
      description: description.trim(),
      price,
      amenities,
      maxGuests,
      image: image || undefined,
    };

    const validatedData = roomTypeSchema.parse(rawData);

    await connectDB();
    const roomType = await RoomType.create(validatedData);

    revalidatePath('/room-types');
    return { success: true, roomType };
  } catch (error: any) {
    console.error('Create room type error:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to create room type' };
  }
}

export async function updateRoomType(id: string, formData: FormData) {
  try {
    // Authentication removed

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const amenitiesStr = formData.get('amenities') as string;
    const maxGuestsStr = formData.get('maxGuests') as string;
    const image = formData.get('image') as string;

    // Validate required fields
    if (!name || name.trim() === '') {
      return { error: 'Room type name is required' };
    }
    if (!description || description.trim() === '') {
      return { error: 'Description is required' };
    }

    const price = parseFloat(priceStr || '0');
    if (isNaN(price) || price < 0) {
      return { error: 'Price must be a valid positive number' };
    }

    const maxGuests = parseInt(maxGuestsStr || '1');
    if (isNaN(maxGuests) || maxGuests < 1) {
      return { error: 'Max guests must be at least 1' };
    }

    // Process amenities
    let amenities: string[] = [];
    if (amenitiesStr && amenitiesStr.trim() !== '') {
      amenities = amenitiesStr.split(',').map((a) => a.trim()).filter((a) => a !== '');
    }

    const rawData = {
      name: name.trim(),
      description: description.trim(),
      price,
      amenities,
      maxGuests,
      image: image || undefined,
    };

    const validatedData = roomTypeSchema.parse(rawData);

    await connectDB();
    const roomType = await RoomType.findByIdAndUpdate(id, validatedData, { new: true });

    if (!roomType) {
      return { error: 'Room type not found' };
    }

    revalidatePath('/room-types');
    return { success: true, roomType };
  } catch (error: any) {
    console.error('Update room type error:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to update room type' };
  }
}

export async function deleteRoomType(id: string) {
  try {
    // Authentication removed

    await connectDB();
    await RoomType.findByIdAndDelete(id);

    revalidatePath('/room-types');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete room type' };
  }
}


