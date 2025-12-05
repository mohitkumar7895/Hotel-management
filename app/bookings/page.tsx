import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import BookingsList from '@/components/BookingsList';

export default async function BookingsPage() {

  await connectDB();
  const bookings = await Booking.find()
    .populate('guestId', 'name email phone')
    .populate('roomId', 'roomNumber')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Bookings</h1>
          <p className="text-gray-400">Manage all bookings and reservations</p>
        </div>
        <a
          href="/bookings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          New Booking
        </a>
      </div>

      <BookingsList bookings={bookings as any} />
    </div>
  );
}


