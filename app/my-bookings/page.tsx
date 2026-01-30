'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Bed, DollarSign, CheckCircle, Clock, XCircle, ArrowLeft, User, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  guestId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    roomTypeId?: {
      name: string;
      price: number;
    };
  };
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  createdAt: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAndBookings();
  }, []);

  const fetchUserAndBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!userResponse.ok) {
        toast.error('Please login to continue');
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      // Only USER role can access my-bookings
      if (userData.user.role && userData.user.role !== 'USER') {
        toast.error('Access denied. This page is for regular users only.');
        // Redirect based on role
        if (userData.user.role === 'superadmin' || userData.user.email === 'superadmin@gmail.com') {
          router.push('/dashboard/super-admin');
        } else if (userData.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (userData.user.role === 'manager') {
          router.push('/dashboard/manager');
        } else if (userData.user.role === 'accountant') {
          router.push('/dashboard/accountant');
        } else if (userData.user.role === 'staff') {
          router.push('/dashboard/staff');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // Fetch bookings
      const bookingsResponse = await fetch('/api/user/bookings', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'checked-in':
        return 'bg-green-500/20 text-green-400';
      case 'checked-out':
        return 'bg-blue-500/20 text-blue-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'partial':
        return 'bg-orange-500/20 text-orange-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            My <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Bookings</span>
          </h1>
          <p className="text-gray-400">View all your hotel bookings and payment status</p>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
              </div>
              {user.name && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-medium">{user.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 border border-slate-700 text-center">
            <Bed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
            <p className="text-gray-400 mb-6">You haven't made any bookings yet.</p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Book a Room
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Left Side - Booking Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Room {booking.roomId.roomNumber}
                        </h3>
                        {booking.roomId.roomTypeId && (
                          <p className="text-gray-400">{booking.roomId.roomTypeId.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">
                          ${booking.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {calculateNights(booking.checkIn, booking.checkOut)} nights
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Check-in</p>
                          <p className="text-white font-medium">
                            {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Check-out</p>
                          <p className="text-white font-medium">
                            {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Guest Information */}
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Guest Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white">{booking.guestId.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white">{booking.guestId.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Phone:</span>
                          <span className="text-white">{booking.guestId.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Address:</span>
                          <span className="text-white">{booking.guestId.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Status */}
                  <div className="lg:w-64 space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Booking Status</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status === 'pending' && <Clock className="w-4 h-4" />}
                        {booking.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                        {booking.status === 'checked-in' && <CheckCircle className="w-4 h-4" />}
                        {booking.status === 'checked-out' && <CheckCircle className="w-4 h-4" />}
                        {booking.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-2">Payment Status</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4" />}
                        {booking.paymentStatus === 'pending' && <Clock className="w-4 h-4" />}
                        {booking.paymentStatus === 'partial' && <DollarSign className="w-4 h-4" />}
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </span>
                    </div>

                    {booking.paymentStatus === 'pending' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm font-semibold">
                          ⚠️ Payment Pending
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Please complete your payment to confirm booking
                        </p>
                      </div>
                    )}

                    {booking.status === 'checked-out' && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-400 text-sm font-semibold">
                          ✓ Stay Completed
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Thank you for staying with us!
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t border-slate-700">
                      Booked on {format(new Date(booking.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




