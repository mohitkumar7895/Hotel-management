'use server';

import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
// Authentication removed
import { revalidatePath } from 'next/cache';

const bookingSchema = z.object({
  guestId: z.string().min(1, 'Guest is required'),
  roomId: z.string().min(1, 'Room is required'),
  checkIn: z.date(),
  checkOut: z.date(),
  totalAmount: z.number().min(0),
  status: z.enum(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']).default('pending'),
  paymentStatus: z.enum(['pending', 'paid', 'partial', 'refunded']).default('pending'),
});

export async function createBooking(formData: FormData) {
  try {
    // Authentication removed

    const rawData = {
      guestId: formData.get('guestId') as string,
      roomId: formData.get('roomId') as string,
      checkIn: new Date(formData.get('checkIn') as string),
      checkOut: new Date(formData.get('checkOut') as string),
      totalAmount: parseFloat(formData.get('totalAmount') as string),
      status: (formData.get('status') as string) || 'pending',
      paymentStatus: (formData.get('paymentStatus') as string) || 'pending',
    };

    const validatedData = bookingSchema.parse(rawData);

    await connectDB();
    const booking = await Booking.create(validatedData);

    revalidatePath('/bookings');
    return { success: true, booking };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to create booking' };
  }
}

export async function deleteBooking(id: string) {
  try {
    // Authentication removed

    await connectDB();
    await Booking.findByIdAndDelete(id);

    revalidatePath('/bookings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete booking' };
  }
}


