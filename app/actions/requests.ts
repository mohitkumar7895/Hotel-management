'use server';

import connectDB from '@/lib/mongodb';
import ServiceRequest from '@/lib/models/ServiceRequest';
import { revalidatePath } from 'next/cache';

export async function updateRequestStatus(id: string, status: string) {
  try {
    // Authentication removed

    await connectDB();
    const request = await ServiceRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!request) {
      return { error: 'Request not found' };
    }

    revalidatePath('/requests');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update request status' };
  }
}


