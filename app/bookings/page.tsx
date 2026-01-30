import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Guest from '@/lib/models/Guest';
import Room from '@/lib/models/Room';
import BookingsList from '@/components/BookingsList';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  await connectDB();
  
  // Ensure models are registered after connection
  // Import models dynamically to ensure they register after DB connection
  await import('@/lib/models/Guest');
  await import('@/lib/models/Room');
  
  const bookings = await Booking.find()
    .populate('guestId', 'name email phone')
    .populate('roomId', 'roomNumber')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Bookings</h1>
          <p className="text-sm sm:text-base text-gray-400">Manage all bookings and reservations</p>
        </div>
        <a
          href="/bookings/new"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base text-center"
        >
          New Booking
        </a>
      </div>

      <BookingsList bookings={bookings as any} />
    </div>
  );
}


