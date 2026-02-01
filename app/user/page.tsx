'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Bed, DollarSign, CheckCircle, Clock, XCircle, User, Mail, Phone, MapPin, Receipt, Coffee, FileText, ArrowLeft } from 'lucide-react';
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

interface Service {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    description?: string;
  };
  quantity: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  bookingId: string;
  roomId: {
    roomNumber: string;
    roomTypeId?: {
      name: string;
    };
  };
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  paymentMode?: string;
  createdAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [servicesMap, setServicesMap] = useState<{ [bookingId: string]: Service[] }>({});
  const [invoicesMap, setInvoicesMap] = useState<{ [bookingId: string]: Invoice[] }>({});
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

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

      // Only USER role can access this page
      if (userData.user.role && userData.user.role !== 'USER') {
        // Redirect based on role
        if (userData.user.role === 'superadmin' || userData.user.email === 'superadmin@gmail.com') {
          window.location.href = '/dashboard/super-admin';
        } else if (userData.user.role === 'admin') {
          window.location.href = '/dashboard/admin';
        } else if (userData.user.role === 'manager') {
          window.location.href = '/dashboard/manager';
        } else if (userData.user.role === 'accountant') {
          window.location.href = '/dashboard/accountant';
        } else if (userData.user.role === 'staff') {
          window.location.href = '/dashboard/staff';
        } else {
          window.location.href = '/dashboard';
        }
        return;
      }
      
      // Continue loading page for USER role

      // Fetch current active booking (only one booking allowed at a time)
      const bookingResponse = await fetch('/api/user/booking', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        const fetchedBooking = bookingData.booking;
        if (fetchedBooking) {
          setBookings([fetchedBooking]);

          // Fetch services and invoices for this booking
          const servicesRes = await fetch(`/api/user/services?bookingId=${fetchedBooking._id}`, {
            credentials: 'include',
            cache: 'no-store',
          });
          if (servicesRes.ok) {
            const servicesResult = await servicesRes.json();
            setServicesMap({ [fetchedBooking._id]: servicesResult.services || [] });
          }

          // Fetch invoices for this booking
          const invoicesRes = await fetch(`/api/user/invoices?bookingId=${fetchedBooking._id}`, {
            credentials: 'include',
            cache: 'no-store',
          });
          if (invoicesRes.ok) {
            const invoicesResult = await invoicesRes.json();
            setInvoicesMap({ [fetchedBooking._id]: invoicesResult.invoices || [] });
          }
        } else {
          setBookings([]);
        }

        // Fetch services and invoices for each booking
        const servicesData: { [key: string]: Service[] } = {};
        const invoicesData: { [key: string]: Invoice[] } = {};

        for (const booking of fetchedBookings) {
          // Fetch services for this booking
          const servicesRes = await fetch(`/api/user/services?bookingId=${booking._id}`, {
            credentials: 'include',
            cache: 'no-store',
          });
          if (servicesRes.ok) {
            const servicesResult = await servicesRes.json();
            servicesData[booking._id] = servicesResult.services || [];
          }

          // Fetch invoices for this booking
          const invoicesRes = await fetch(`/api/user/invoices?bookingId=${booking._id}`, {
            credentials: 'include',
            cache: 'no-store',
          });
          if (invoicesRes.ok) {
            const invoicesResult = await invoicesRes.json();
            invoicesData[booking._id] = invoicesResult.invoices || [];
          }
        }

        setServicesMap(servicesData);
        setInvoicesMap(invoicesData);
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
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            My <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-gray-400">View your bookings, services, and bills</p>
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
            <h3 className="text-xl font-bold text-white mb-2">No Room Booked Yet</h3>
            <p className="text-gray-400 mb-6">You haven't booked any room yet. Book your stay now!</p>
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
                          <>
                            <p className="text-gray-400">{booking.roomId.roomTypeId.name}</p>
                            {booking.roomId.roomTypeId.amenities && Array.isArray(booking.roomId.roomTypeId.amenities) && booking.roomId.roomTypeId.amenities.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {booking.roomId.roomTypeId.amenities.map((amenity: string, idx: number) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
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

                {/* Expandable Details Section */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <button
                    onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                    className="w-full flex items-center justify-between text-left text-white hover:text-blue-400 transition-colors"
                  >
                    <span className="font-semibold">View Details</span>
                    <span className={`transform transition-transform ${expandedBooking === booking._id ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {expandedBooking === booking._id && (
                    <div className="mt-4 space-y-6">
                      {/* Services Section */}
                      {servicesMap[booking._id] && servicesMap[booking._id].length > 0 && (
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Coffee className="w-5 h-5 text-blue-400" />
                            Services Provided
                          </h4>
                          <div className="space-y-3">
                            {servicesMap[booking._id].map((service) => (
                              <div key={service._id} className="bg-slate-900/50 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-white font-medium">{service.serviceId.name}</p>
                                    <p className="text-gray-400 text-sm mt-1">{service.serviceId.description || service.serviceId.category}</p>
                                    {service.scheduledDate && (
                                      <p className="text-gray-500 text-xs mt-1">
                                        Scheduled: {format(new Date(service.scheduledDate), 'MMM dd, yyyy')}
                                        {service.scheduledTime && ` at ${service.scheduledTime}`}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="text-blue-400 font-semibold">
                                      ${service.totalAmount.toLocaleString()}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      Qty: {service.quantity} × ${service.serviceId.price}/{service.serviceId.unit}
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                                      service.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                                      service.paymentStatus === 'partial' ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                      {service.paymentStatus}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Invoices/Bills Section */}
                      {invoicesMap[booking._id] && invoicesMap[booking._id].length > 0 && (
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-green-400" />
                            Bills & Invoices
                          </h4>
                          <div className="space-y-4">
                            {invoicesMap[booking._id].map((invoice) => (
                              <div key={invoice._id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="text-white font-semibold">Invoice #{invoice.invoiceNumber}</p>
                                    <p className="text-gray-400 text-sm">
                                      {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-green-400 font-bold text-lg">
                                      ${invoice.totalAmount.toLocaleString()}
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                                      invoice.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                                      invoice.paymentStatus === 'partial' ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                      {invoice.paymentStatus}
                                    </span>
                                  </div>
                                </div>

                                {/* Invoice Items */}
                                <div className="mt-3 space-y-2">
                                  {invoice.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-700/50">
                                      <span className="text-gray-300">{item.description}</span>
                                      <span className="text-white">
                                        {item.quantity} × ${item.rate} = ${item.amount}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Invoice Summary */}
                                <div className="mt-4 pt-3 border-t border-slate-700 space-y-1 text-sm">
                                  <div className="flex justify-between text-gray-400">
                                    <span>Subtotal:</span>
                                    <span>${invoice.subtotal.toLocaleString()}</span>
                                  </div>
                                  {invoice.tax > 0 && (
                                    <div className="flex justify-between text-gray-400">
                                      <span>Tax:</span>
                                      <span>${invoice.tax.toLocaleString()}</span>
                                    </div>
                                  )}
                                  {invoice.discount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                      <span>Discount:</span>
                                      <span>-${invoice.discount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-white font-semibold pt-2 border-t border-slate-700">
                                    <span>Total:</span>
                                    <span>${invoice.totalAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-400 pt-1">
                                    <span>Paid:</span>
                                    <span className="text-green-400">${invoice.paidAmount.toLocaleString()}</span>
                                  </div>
                                  {invoice.dueAmount > 0 && (
                                    <div className="flex justify-between text-orange-400 pt-1">
                                      <span>Due:</span>
                                      <span>${invoice.dueAmount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  {invoice.paymentMode && (
                                    <div className="flex justify-between text-gray-500 text-xs pt-1">
                                      <span>Payment Mode:</span>
                                      <span className="uppercase">{invoice.paymentMode}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Services or Invoices Message */}
                      {(!servicesMap[booking._id] || servicesMap[booking._id].length === 0) &&
                       (!invoicesMap[booking._id] || invoicesMap[booking._id].length === 0) && (
                        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                          <p className="text-gray-400">No services or invoices available for this booking yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

