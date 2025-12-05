'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createRoom } from '@/app/actions/rooms';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  roomTypeId: z.string().optional(),
  floor: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Floor must be a valid number',
  }),
  status: z.string(),
});

type RoomForm = z.infer<typeof roomSchema>;

interface RoomType {
  _id: string;
  name: string;
}

export default function NewRoomPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      status: 'available',
    },
  });

  useEffect(() => {
    // Fetch room types from API
    fetch('/api/room-types')
      .then((res) => res.json())
      .then((data) => {
        if (data.roomTypes) {
          setRoomTypes(data.roomTypes);
        }
      })
      .catch((error) => {
        console.error('Error fetching room types:', error);
      });
  }, []);

  const onSubmit = async (data: RoomForm) => {
    setIsLoading(true);
    try {
      // Get the actual room type ID
      const actualRoomTypeId = selectedRoomTypeId || data.roomTypeId;
      
      if (!actualRoomTypeId || actualRoomTypeId.trim() === '') {
        toast.error('Room type is required');
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('roomNumber', data.roomNumber);
      formData.append('roomTypeId', actualRoomTypeId);
      formData.append('floor', data.floor);
      formData.append('status', data.status);

      const result = await createRoom(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Room created successfully!');
        router.push('/rooms');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/rooms" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Rooms</span>
      </Link>

      {/* Header Card */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Create Room</h1>
        <p className="text-gray-400">Add a new room to your system</p>
      </div>

      {/* Form Card */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-300 mb-2">
              Room Number
            </label>
            <input
              {...register('roomNumber')}
              type="text"
              id="roomNumber"
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., 101"
            />
            {errors.roomNumber && (
              <p className="mt-1 text-sm text-red-400">{errors.roomNumber.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="roomTypeId" className="block text-sm font-medium text-gray-300 mb-2">
              Room Type
            </label>
            <select
              id="roomTypeId"
              value={selectedRoomTypeId}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedRoomTypeId(value);
                setValue('roomTypeId', value);
              }}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">Select a room type</option>
              {roomTypes.map((roomType) => (
                <option key={roomType._id} value={roomType._id}>
                  {roomType.name}
                </option>
              ))}
            </select>
            {errors.roomTypeId && (
              <p className="mt-1 text-sm text-red-400">{errors.roomTypeId.message}</p>
            )}
            {roomTypes.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">No room types available. Please create a room type first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-300 mb-2">
                Floor
              </label>
              <input
                {...register('floor')}
                type="number"
                id="floor"
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="0"
              />
              {errors.floor && (
                <p className="mt-1 text-sm text-red-400">{errors.floor.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
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


