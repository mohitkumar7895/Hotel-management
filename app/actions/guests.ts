'use server';

import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';
// Authentication removed
import { revalidatePath } from 'next/cache';

const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Address is required'),
  idProof: z.string().min(1, 'ID proof is required'),
  checkIn: z.string().nullable().optional(),
  checkOut: z.string().nullable().optional(),
  roomId: z.string().nullable().optional(),
  roomTypeId: z.string().nullable().optional(),
});

export async function createGuest(formData: FormData) {
  try {
    // Authentication removed

    const rawData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      idProof: formData.get('idProof') as string,
      checkIn: (formData.get('checkIn') as string) || null,
      checkOut: (formData.get('checkOut') as string) || null,
      roomId: (formData.get('roomId') as string) || null,
      roomTypeId: (formData.get('roomTypeId') as string) || null,
    };

    const validatedData = guestSchema.parse(rawData);

    // Convert date strings to Date objects for database
    const guestData: any = {
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      address: validatedData.address,
      idProof: validatedData.idProof,
    };

    if (validatedData.checkIn && validatedData.checkIn.trim() !== '') {
      guestData.checkIn = new Date(validatedData.checkIn);
    }
    if (validatedData.checkOut && validatedData.checkOut.trim() !== '') {
      guestData.checkOut = new Date(validatedData.checkOut);
    }
    if (validatedData.roomId && validatedData.roomId.trim() !== '') {
      guestData.roomId = validatedData.roomId;
    }
    if (validatedData.roomTypeId && validatedData.roomTypeId.trim() !== '') {
      guestData.roomTypeId = validatedData.roomTypeId;
    }

    await connectDB();
    const guest = await Guest.create(guestData);

    revalidatePath('/guests');
    return { success: true, guest };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to create guest' };
  }
}

export async function updateGuest(id: string, formData: FormData) {
  try {
    // Authentication removed

    const rawData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      idProof: formData.get('idProof') as string,
      checkIn: (formData.get('checkIn') as string) || null,
      checkOut: (formData.get('checkOut') as string) || null,
      roomId: (formData.get('roomId') as string) || null,
      roomTypeId: (formData.get('roomTypeId') as string) || null,
    };

    const validatedData = guestSchema.parse(rawData);

    // Convert date strings to Date objects for database
    const guestData: any = {
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      address: validatedData.address,
      idProof: validatedData.idProof,
    };

    if (validatedData.checkIn && validatedData.checkIn.trim() !== '') {
      guestData.checkIn = new Date(validatedData.checkIn);
    }
    if (validatedData.checkOut && validatedData.checkOut.trim() !== '') {
      guestData.checkOut = new Date(validatedData.checkOut);
    }
    if (validatedData.roomId && validatedData.roomId.trim() !== '') {
      guestData.roomId = validatedData.roomId;
    }
    if (validatedData.roomTypeId && validatedData.roomTypeId.trim() !== '') {
      guestData.roomTypeId = validatedData.roomTypeId;
    }

    await connectDB();
    const guest = await Guest.findByIdAndUpdate(id, guestData, { new: true });

    if (!guest) {
      return { error: 'Guest not found' };
    }

    revalidatePath('/guests');
    return { success: true, guest };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to update guest' };
  }
}

export async function deleteGuest(id: string) {
  try {
    // Authentication removed

    await connectDB();
    await Guest.findByIdAndDelete(id);

    revalidatePath('/guests');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete guest' };
  }
}


