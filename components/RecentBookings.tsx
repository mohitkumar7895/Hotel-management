import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface Booking {
  _id: string;
  guestId: {
    name: string;
    email: string;
    phone: string;
  };
  roomId: {
    roomNumber: string;
  };
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

export default function RecentBookings({ bookings }: { bookings: Booking[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'checked-in':
        return 'bg-green-500/20 text-green-400';
      case 'checked-out':
        return 'bg-gray-500/20 text-gray-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
        <Link
          href="/bookings"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Guest</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Room</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Check-in</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{booking.guestId.name}</p>
                      <p className="text-gray-400 text-sm">{booking.guestId.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">{booking.roomId.roomNumber}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-white">${booking.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


