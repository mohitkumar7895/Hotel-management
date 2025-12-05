'use server';

import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import ExtraService from '@/lib/models/ExtraService';
// Authentication removed
import { revalidatePath } from 'next/cache';

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export async function createExtraService(formData: FormData) {
  try {
    // Authentication removed

    const rawData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      icon: formData.get('icon') as string,
      description: formData.get('description') as string,
    };

    const validatedData = serviceSchema.parse(rawData);

    await connectDB();
    const service = await ExtraService.create(validatedData);

    revalidatePath('/extra-services');
    return { success: true, service };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to create service' };
  }
}

export async function deleteExtraService(id: string) {
  try {
    // Authentication removed

    await connectDB();
    await ExtraService.findByIdAndDelete(id);

    revalidatePath('/extra-services');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete service' };
  }
}


