'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Users, Bed, ArrowLeft, CheckCircle, X, CreditCard, DollarSign, AlertCircle, Lock } from 'lucide-react';

interface RoomType {
  _id: string;
  name: string;
  description: string;
  price: number;
  amenities: string[];
  maxGuests: number;
}

interface Room {
  _id: string;
  roomNumber: string;
  roomTypeId: RoomType;
  status: string;
}

export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    roomTypeId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
    address: '',
    idProof: '',
    selectedRoomId: '',
    paymentMethod: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [nights, setNights] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    // Set roomTypeId from URL parameter if present
    const roomTypeParam = searchParams.get('roomType');
    if (roomTypeParam && roomTypes.length > 0) {
      setFormData(prev => ({ ...prev, roomTypeId: roomTypeParam }));
    }
  }, [searchParams, roomTypes]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut && formData.roomTypeId) {
      calculateTotal();
      checkAvailability();
    }
  }, [formData.checkIn, formData.checkOut, formData.roomTypeId]);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/room-types');
      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data.roomTypes || []);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const checkAvailability = async () => {
    if (!formData.checkIn || !formData.checkOut || !formData.roomTypeId) return;

    try {
      const response = await fetch(`/api/rooms?roomTypeId=${formData.roomTypeId}&status=available`);
      if (response.ok) {
        const data = await response.json();
        // Filter rooms by availability dates (simplified - in production, check booking conflicts)
        setAvailableRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut || !formData.roomTypeId) return;

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNights(diffDays);

    const selectedRoomType = roomTypes.find(rt => rt._id === formData.roomTypeId);
    if (selectedRoomType) {
      setTotalAmount(selectedRoomType.price * diffDays);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Format card number
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.slice(0, 19);
    }
    
    // Format expiry date
    if (e.target.name === 'cardExpiry') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      if (value.length > 5) value = value.slice(0, 5);
    }
    
    // Format CVC (numbers only)
    if (e.target.name === 'cardCVC') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.checkIn || !formData.checkOut || !formData.roomTypeId) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
        toast.error('Check-out date must be after check-in date');
        return;
      }
      if (availableRooms.length === 0) {
        toast.error('No rooms available for selected dates');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.selectedRoomId) {
        toast.error('Please select a room');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.idProof) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // First create guest
      const guestResponse = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          idProof: formData.idProof,
        }),
      });

      if (!guestResponse.ok) {
        const error = await guestResponse.json();
        throw new Error(error.error || 'Failed to create guest');
      }

      const guestData = await guestResponse.json();
      const guestId = guestData.guest._id;

      // Then create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: guestId,
          roomId: formData.selectedRoomId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          totalAmount: totalAmount,
          status: 'pending',
          paymentStatus: 'pending',
        }),
      });

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      setBookingId(bookingData.booking._id);
      setPaymentPending(true);
      toast.success('Booking created! Please complete payment to confirm.');
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) {
      toast.error('Booking not found');
      return;
    }

    if (!formData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (formData.paymentMethod === 'card' && (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCVC)) {
      toast.error('Please fill in all card details');
      return;
    }

    setLoading(true);

    try {
      // Update booking payment status
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'paid',
          status: 'confirmed',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      // Create payment record
      await fetch('/api/accounts/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: totalAmount,
          paymentMode: formData.paymentMethod === 'card' ? 'card' : 'cash',
          notes: `Payment for booking ${bookingId}`,
        }),
      });

      toast.success('Payment completed successfully! Booking confirmed.');
      setPaymentPending(false);
      setTimeout(() => {
        router.push('/my-bookings');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoomType = roomTypes.find(rt => rt._id === formData.roomTypeId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Book Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Stay</span>
          </h1>
          <p className="text-gray-400">Complete your reservation in just a few steps</p>
        </div>

        {/* Payment Pending Warning */}
        {paymentPending && bookingId && (
          <div className="mb-6 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">⚠️ Payment Pending</h3>
                <p className="text-gray-300 mb-4">
                  Please complete your payment to confirm booking. Your booking is currently pending payment.
                </p>
                <button
                  onClick={() => setStep(4)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Complete Payment Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-slate-800 text-gray-400'
              }`}>
                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-16 md:w-20 h-1 ${step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Dates & Room Type */}
        {step === 1 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Select Dates & Room</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Bed className="w-4 h-4 inline mr-2" />
                  Room Type *
                </label>
                <select
                  name="roomTypeId"
                  value={formData.roomTypeId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.map((rt) => (
                    <option key={rt._id} value={rt._id}>
                      {rt.name} - ${rt.price}/night (Max {rt.maxGuests} guests)
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoomType && formData.checkIn && formData.checkOut && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Total Nights:</span>
                    <span className="text-white font-semibold">{nights} nights</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Price per night:</span>
                    <span className="text-white font-semibold">${selectedRoomType.price}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-500/30">
                    <span className="text-white font-bold text-lg">Total Amount:</span>
                    <span className="text-blue-400 font-bold text-xl">${totalAmount}</span>
                  </div>
                </div>
              )}

              {availableRooms.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold">
                    ✓ {availableRooms.length} room(s) available for selected dates
                  </p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Continue to Room Selection
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Room */}
        {step === 2 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Select Your Room</h2>
            <div className="space-y-4 mb-6">
              {availableRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => setFormData({ ...formData, selectedRoomId: room._id })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.selectedRoomId === room._id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Room {room.roomNumber}</h3>
                      <p className="text-gray-400">{selectedRoomType?.name}</p>
                    </div>
                    {formData.selectedRoomId === room._id && (
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Continue to Guest Information
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Guest Information */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Guest Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ID Proof Number *</label>
                  <input
                    type="text"
                    name="idProof"
                    value={formData.idProof}
                    onChange={handleChange}
                    required
                    placeholder="Aadhar/PAN/Passport Number"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleChange(e as any)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-white font-bold text-lg mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Room:</span>
                    <span className="text-white">Room {availableRooms.find(r => r._id === formData.selectedRoomId)?.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Check-in:</span>
                    <span className="text-white">{new Date(formData.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Check-out:</span>
                    <span className="text-white">{new Date(formData.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Nights:</span>
                    <span className="text-white">{nights}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-500/30">
                    <span className="text-white font-bold">Total Amount:</span>
                    <span className="text-blue-400 font-bold text-lg">${totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Create Booking & Proceed to Payment'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 4: Payment */}
        {step === 4 && bookingId && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
                  <p className="text-gray-400">Please complete your payment to confirm booking</p>
                </div>
              </div>
            </div>

            {/* Payment Pending Warning */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">⚠️ Payment Pending</h3>
                  <p className="text-gray-300">
                    Your booking has been created but payment is pending. Complete payment now to confirm your reservation.
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-white font-bold text-lg mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Room:</span>
                  <span className="text-white">Room {availableRooms.find(r => r._id === formData.selectedRoomId)?.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Check-in:</span>
                  <span className="text-white">{new Date(formData.checkIn).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Check-out:</span>
                  <span className="text-white">{new Date(formData.checkOut).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Nights:</span>
                  <span className="text-white">{nights}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-500/30">
                  <span className="text-white font-bold text-lg">Total Amount:</span>
                  <span className="text-blue-400 font-bold text-xl">${totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">Select Payment Method *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                      <div className="text-left">
                        <div className="text-white font-semibold">Credit/Debit Card</div>
                        <div className="text-gray-400 text-sm">Visa, Mastercard, Amex</div>
                      </div>
                      {formData.paymentMethod === 'card' && (
                        <CheckCircle className="w-5 h-5 text-blue-400 ml-auto" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-6 h-6 text-green-400" />
                      <div className="text-left">
                        <div className="text-white font-semibold">Cash Payment</div>
                        <div className="text-gray-400 text-sm">Pay at hotel reception</div>
                      </div>
                      {formData.paymentMethod === 'cash' && (
                        <CheckCircle className="w-5 h-5 text-blue-400 ml-auto" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Card Details Form */}
              {formData.paymentMethod === 'card' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 text-sm">Secure payment processing</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CVC *</label>
                      <input
                        type="text"
                        name="cardCVC"
                        value={formData.cardCVC}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength={4}
                        required
                        className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Payment Info */}
              {formData.paymentMethod === 'cash' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-6 h-6 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-2">Cash Payment Instructions</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        You can pay in cash at the hotel reception during check-in. Your booking is confirmed and the room will be held for you.
                      </p>
                      <p className="text-gray-400 text-xs">
                        Note: Please arrive on time for check-in to secure your reservation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading || !formData.paymentMethod}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Complete Payment & Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


