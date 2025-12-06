'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateGuest } from '@/app/actions/guests';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Address is required'),
  idProof: z.string().min(1, 'ID proof is required'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  roomTypeId: z.string().optional(),
});

type GuestForm = z.infer<typeof guestSchema>;

const roomTypeOptions = [
  'Single Room',
  'Double Room',
  'Twin Room',
  'Deluxe Room',
  'Super Deluxe',
  'Suite',
  'Family Room',
  'King Room',
  'Queen Room',
];

export default function EditGuestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [guest, setGuest] = useState<any>(null);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [customRoomType, setCustomRoomType] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GuestForm>({
    resolver: zodResolver(guestSchema),
  });

  useEffect(() => {
    fetch(`/api/guests/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.guest) {
          setGuest(data.guest);
          setValue('name', data.guest.name);
          setValue('phone', data.guest.phone);
          setValue('email', data.guest.email);
          setValue('address', data.guest.address);
          setValue('idProof', data.guest.idProof);
          
          // Set dates
          if (data.guest.checkIn) {
            const checkInDate = new Date(data.guest.checkIn);
            setValue('checkIn', checkInDate.toISOString().split('T')[0]);
          }
          if (data.guest.checkOut) {
            const checkOutDate = new Date(data.guest.checkOut);
            setValue('checkOut', checkOutDate.toISOString().split('T')[0]);
          }
          
          // Set room type
          if (data.guest.roomTypeId) {
            const roomTypeName = data.guest.roomTypeId;
            if (roomTypeOptions.includes(roomTypeName)) {
              setSelectedRoomType(roomTypeName);
              setCustomRoomType('');
            } else {
              setSelectedRoomType('custom');
              setCustomRoomType(roomTypeName);
            }
            setValue('roomTypeId', roomTypeName);
          }
        }
      })
      .catch(() => toast.error('Failed to load guest'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onSubmit = async (data: GuestForm) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('address', data.address);
      formData.append('idProof', data.idProof);
      if (data.checkIn) formData.append('checkIn', data.checkIn);
      if (data.checkOut) formData.append('checkOut', data.checkOut);
      
      // Get roomTypeId from state
      if (selectedRoomType && selectedRoomType !== '' && selectedRoomType !== 'custom') {
        formData.append('roomTypeId', selectedRoomType);
      } else if (selectedRoomType === 'custom' && customRoomType && customRoomType.trim() !== '') {
        formData.append('roomTypeId', customRoomType);
      }

      const result = await updateGuest(params.id, formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Guest updated successfully!');
        window.location.href = '/guests';
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!guest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link 
          href="/guests" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Guests</span>
        </Link>

        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Edit Guest</h1>
          <p className="text-gray-400">Update guest information</p>
        </div>

        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <textarea
                {...register('address')}
                id="address"
                rows={3}
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="idProof" className="block text-sm font-medium text-gray-300 mb-2">
                ID Proof
              </label>
              <input
                {...register('idProof')}
                type="text"
                id="idProof"
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Passport/ID number"
              />
              {errors.idProof && (
                <p className="mt-1 text-sm text-red-400">{errors.idProof.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="roomTypeId" className="block text-sm font-medium text-gray-300 mb-2">
                Room Type (Optional)
              </label>
              <select
                id="roomTypeId"
                value={selectedRoomType}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedRoomType(value);
                  if (value !== 'custom') {
                    setValue('roomTypeId', value);
                    setCustomRoomType('');
                  } else {
                    setValue('roomTypeId', customRoomType || '');
                  }
                }}
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="">Select a room type</option>
                {roomTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value="custom">Other (Custom)</option>
              </select>
              {selectedRoomType === 'custom' && (
                <input
                  type="text"
                  value={customRoomType}
                  onChange={(e) => {
                    setCustomRoomType(e.target.value);
                    setValue('roomTypeId', e.target.value);
                  }}
                  placeholder="Enter custom room type"
                  className="w-full mt-2 px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium text-gray-300 mb-2">
                  Check-in Date (Optional)
                </label>
                <input
                  {...register('checkIn')}
                  type="date"
                  id="checkIn"
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium text-gray-300 mb-2">
                  Check-out Date (Optional)
                </label>
                <input
                  {...register('checkOut')}
                  type="date"
                  id="checkOut"
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Guest'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


