'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface ExtraService {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  duration?: number;
  isAvailable: boolean;
}

interface Guest {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface Booking {
  _id: string;
  guestId: { name: string };
  roomId: { roomNumber: string };
  checkIn: string;
  checkOut: string;
  status: string;
}

const PAYMENT_MODES = ['cash', 'card', 'upi', 'netbanking'];
const STATUS_OPTIONS = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'partial'];

export default function NewServiceBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ExtraService[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedService, setSelectedService] = useState<ExtraService | null>(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    guestId: '',
    bookingId: '',
    quantity: '1',
    scheduledDate: '',
    scheduledTime: '',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMode: 'cash',
    notes: '',
  });

  useEffect(() => {
    fetchServices();
    fetchGuests();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (formData.serviceId) {
      const service = services.find((s) => s._id === formData.serviceId);
      setSelectedService(service || null);
    } else {
      setSelectedService(null);
    }
  }, [formData.serviceId, services]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/extra-services?isAvailable=true');
      if (response.ok) {
        const result = await response.json();
        setServices(result.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests');
      if (response.ok) {
        const result = await response.json();
        setGuests(result.guests || []);
      }
    } catch (error) {
      console.error('Failed to fetch guests:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const result = await response.json();
        setBookings(result.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    const quantity = parseInt(formData.quantity) || 1;
    let total = selectedService.price * quantity;

    if (selectedService.unit === 'per_hour' && selectedService.duration) {
      const hours = selectedService.duration / 60;
      total = selectedService.price * hours * quantity;
    }

    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceId || !formData.guestId || !formData.quantity) {
      alert('Please fill all required fields');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          bookingId: formData.bookingId || undefined,
          scheduledDate: formData.scheduledDate || undefined,
          scheduledTime: formData.scheduledTime || undefined,
          notes: formData.notes?.trim() || undefined,
          paymentMode: formData.paymentStatus === 'paid' ? formData.paymentMode : undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.booking) {
        alert('✅ Service booking created successfully!');
        router.push('/extra-services/bookings');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert(`❌ Error: ${result.error || 'Failed to create booking'}`);
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/extra-services/bookings"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">New Service Booking</h1>
          <p className="text-gray-400">Book a service for a guest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-lg border border-[#334155] p-6 space-y-6">
        {/* Service Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Service Selection
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - {formatCurrency(service.price)} ({service.unit})
                </option>
              ))}
            </select>
            {selectedService && (
              <div className="mt-2 p-3 bg-[#0f172a] rounded-lg border border-[#334155]">
                <div className="text-sm text-gray-300">
                  <div>Category: {selectedService.category}</div>
                  {selectedService.duration && <div>Duration: {selectedService.duration} minutes</div>}
                  <div>Unit Price: {formatCurrency(selectedService.price)}</div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {selectedService && (
            <div className="p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
              <div className="text-white font-semibold">
                Total Amount: {formatCurrency(calculateTotal())}
              </div>
            </div>
          )}
        </div>

        {/* Guest & Booking */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Guest & Booking
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Guest <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={formData.guestId}
              onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a guest</option>
              {guests.map((guest) => (
                <option key={guest._id} value={guest._id}>
                  {guest.name} - {guest.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Booking (Optional)
            </label>
            <select
              value={formData.bookingId}
              onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">No booking (direct service)</option>
              {bookings
                .filter((b) => b.guestId && b.status === 'checked-in')
                .map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.guestId.name} - Room {booking.roomId?.roomNumber || 'N/A'}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Scheduling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scheduled Date
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scheduled Time
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status & Payment */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Status & Payment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.paymentStatus === 'paid' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Mode <span className="text-red-400">*</span>
              </label>
              <select
                required={formData.paymentStatus === 'paid'}
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="Additional notes or special instructions..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4 border-t border-[#334155]">
          <Link
            href="/extra-services/bookings"
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

