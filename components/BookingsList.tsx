'use client';

import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteBooking } from '@/app/actions/bookings';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  guestId: {
    name: string;
    email: string;
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

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    setDeleting(id);
    try {
      const result = await deleteBooking(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Booking deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete booking');
    } finally {
      setDeleting(null);
    }
  };

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

  if (bookings.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400 mb-4">No bookings found</p>
        <Link href="/bookings/new" className="text-blue-400 hover:text-blue-300">
          Create your first booking
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Guest</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Room</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Check-in</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Check-out</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Payment</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-white font-medium">{booking.guestId.name}</p>
                    <p className="text-gray-400 text-xs">{booking.guestId.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-white">{booking.roomId.roomNumber}</td>
                <td className="py-3 px-4 text-gray-300">
                  {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
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
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/bookings/${booking._id}/edit`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(booking._id)}
                      disabled={deleting === booking._id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



