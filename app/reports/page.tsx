import connectDB from '@/lib/mongodb';
import Account from '@/lib/models/Account';
import Booking from '@/lib/models/Booking';
import Room from '@/lib/models/Room';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import ReportsView from '@/components/ReportsView';

export default async function ReportsPage() {

  await connectDB();

  // Revenue data
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthlyRevenue = await Account.aggregate([
    {
      $match: {
        type: 'income',
        date: { $gte: monthStart, $lte: monthEnd },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  // Occupancy data
  const totalRooms = await Room.countDocuments();
  const occupiedRooms = await Room.countDocuments({ status: 'booked' });
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate('guestId', 'name')
    .populate('roomId', 'roomNumber')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Reports</h1>
        <p className="text-gray-400">View revenue, occupancy, and booking reports</p>
      </div>

      <ReportsView
        monthlyRevenue={monthlyRevenue[0]?.total || 0}
        occupancyRate={occupancyRate}
        bookings={recentBookings as any}
      />
    </div>
  );
}


