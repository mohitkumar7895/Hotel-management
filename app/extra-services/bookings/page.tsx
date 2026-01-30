'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  User,
  Calendar,
} from 'lucide-react';

interface ServiceBooking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
  };
  guestId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  bookingId?: {
    _id: string;
    checkIn: string;
    checkOut: string;
    status: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  scheduledDate?: string;
  scheduledTime?: string;
  status: string;
  paymentStatus: string;
  paymentMode?: string;
  notes?: string;
  createdAt: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const PAYMENT_STATUS_COLORS: { [key: string]: string } = {
  pending: 'bg-yellow-500',
  paid: 'bg-green-500',
  partial: 'bg-orange-500',
};

export default function ServiceBookingsPage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, paymentStatusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);

      const response = await fetch(`/api/service-bookings?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setBookings(result.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/service-bookings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Booking deleted successfully!');
        fetchBookings();
      } else {
        const result = await response.json();
        alert(`❌ Error: ${result.error || 'Failed to delete booking'}`);
      }
    } catch (error) {
      console.error('Failed to delete booking:', error);
      alert('Failed to delete booking. Please check console for details.');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.guestId.name.toLowerCase().includes(search) ||
        booking.serviceId.name.toLowerCase().includes(search) ||
        booking.guestId.email.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Service Bookings</h1>
          <p className="text-gray-400">Manage service bookings for guests</p>
        </div>
        <Link
          href="/extra-services/bookings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by guest or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No service bookings found</p>
          <Link
            href="/extra-services/bookings/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create First Booking
          </Link>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Scheduled</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white font-medium">{booking.guestId.name}</div>
                        <div className="text-gray-400 text-sm">{booking.guestId.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{booking.serviceId.name}</div>
                      <div className="text-gray-400 text-xs">{booking.serviceId.category}</div>
                    </td>
                    <td className="py-3 px-4 text-white">{booking.quantity}</td>
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{formatCurrency(booking.totalAmount)}</div>
                      {booking.paymentMode && (
                        <div className="text-gray-400 text-xs">{booking.paymentMode}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {booking.scheduledDate ? (
                        <div>
                          <div className="text-white text-sm">
                            {format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}
                          </div>
                          {booking.scheduledTime && (
                            <div className="text-gray-400 text-xs">{booking.scheduledTime}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs text-white ${STATUS_COLORS[booking.status] || 'bg-gray-500'}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs text-white ${PAYMENT_STATUS_COLORS[booking.paymentStatus] || 'bg-gray-500'}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/extra-services/bookings/${booking._id}/edit`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="text-red-400 hover:text-red-300"
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
      )}
    </div>
  );
}






