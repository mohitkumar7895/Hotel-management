'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Room {
  _id: string;
  roomNumber: string;
  status: string;
}

interface Guest {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface ExtraService {
  _id: string;
  name: string;
  category: string;
}

interface Booking {
  _id: string;
  guestId: { name: string };
  roomId: { roomNumber: string };
  status: string;
}

const REQUEST_TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'concierge', label: 'Concierge' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [services, setServices] = useState<ExtraService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    roomId: '',
    guestId: '',
    bookingId: '',
    serviceId: '',
    requestType: 'service',
    priority: 'medium',
    notes: '',
    estimatedTime: '',
  });

  useEffect(() => {
    fetchRooms();
    fetchGuests();
    fetchServices();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (formData.roomId) {
      // Auto-select guest if room has active booking
      const activeBooking = bookings.find(
        (b) => (b.roomId as any)._id?.toString() === formData.roomId && b.status === 'checked-in'
      );
      if (activeBooking) {
        const guestId = (activeBooking.guestId as any)._id?.toString() || activeBooking.guestId;
        const guest = guests.find((g) => g._id === guestId);
        if (guest) {
          setFormData((prev) => ({ ...prev, guestId: guest._id, bookingId: activeBooking._id }));
        }
      }
    }
  }, [formData.roomId, bookings, guests]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const result = await response.json();
        setRooms(result.rooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomId) {
      alert('Please select a room');
      return;
    }

    setLoading(true);

    try {
      // Build request body - only include fields that have values
      const requestBody: any = {
        roomId: formData.roomId,
        requestType: formData.requestType,
        priority: formData.priority,
      };

      // Only add optional fields if they have values
      if (formData.guestId && formData.guestId.trim() !== '') {
        requestBody.guestId = formData.guestId.trim();
      }

      if (formData.bookingId && formData.bookingId.trim() !== '') {
        requestBody.bookingId = formData.bookingId.trim();
      }

      if (formData.serviceId && formData.serviceId.trim() !== '') {
        requestBody.serviceId = formData.serviceId.trim();
      }

      if (formData.notes && formData.notes.trim() !== '') {
        requestBody.notes = formData.notes.trim();
      }

      if (formData.estimatedTime && formData.estimatedTime.trim() !== '') {
        requestBody.estimatedTime = formData.estimatedTime.trim();
      }

      console.log('📤 Submitting request:', requestBody);

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('📥 Response data:', result);

      if (response.ok && result.request) {
        alert('✅ Service request created successfully in MongoDB Atlas!');
        // Clear form
        setFormData({
          roomId: '',
          guestId: '',
          bookingId: '',
          serviceId: '',
          requestType: 'service',
          priority: 'medium',
          notes: '',
          estimatedTime: '',
        });
        router.push('/requests');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const errorMsg = result.error || 'Failed to create request';
        alert(`❌ Error: ${errorMsg}`);
        console.error('❌ Error response:', result);
      }
    } catch (error) {
      console.error('❌ Failed to create request:', error);
      alert('Failed to create request. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/requests"
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">New Service Request</h1>
          <p className="text-sm sm:text-base text-gray-400">Create a new service request for a guest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    Room {room.roomNumber} ({room.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Guest (Optional)
              </label>
              <select
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Request Type
              </label>
              <select
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {REQUEST_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Service Selection (Optional)
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">No specific service (general request)</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} ({service.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Additional Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Describe the request or any special requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., 30"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4 border-t border-[#334155]">
          <Link
            href="/requests"
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

