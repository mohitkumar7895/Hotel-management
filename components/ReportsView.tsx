'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  guestId: {
    name: string;
  };
  roomId: {
    roomNumber: string;
  };
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  status: string;
}

export default function ReportsView({
  monthlyRevenue,
  occupancyRate,
  bookings,
}: {
  monthlyRevenue: number;
  occupancyRate: number;
  bookings: Booking[];
}) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    const csv = [
      ['Guest Name', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status'].join(','),
      ...bookings.map((b) =>
        [
          b.guestId.name,
          b.roomId.roomNumber,
          format(new Date(b.checkIn), 'yyyy-MM-dd'),
          format(new Date(b.checkOut), 'yyyy-MM-dd'),
          b.totalAmount,
          b.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-blue-400">${monthlyRevenue.toLocaleString()}</p>
          <p className="text-gray-400 text-sm mt-2">Current month income</p>
        </div>

        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Occupancy Rate</h3>
          <p className="text-3xl font-bold text-green-400">{occupancyRate.toFixed(1)}%</p>
          <p className="text-gray-400 text-sm mt-2">Current occupancy</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

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
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                  <td className="py-3 px-4 text-white">{booking.guestId.name}</td>
                  <td className="py-3 px-4 text-gray-300">{booking.roomId.roomNumber}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-white">${booking.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'checked-out'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


