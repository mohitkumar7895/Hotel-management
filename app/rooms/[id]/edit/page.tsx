'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateRoom } from '@/app/actions/rooms';
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

export default function EditRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
  });

  useEffect(() => {
    // Fetch room types
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

    // Fetch room data
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setRoom(data.room);
          setValue('roomNumber', data.room.roomNumber);
          setValue('floor', data.room.floor.toString());
          setValue('status', data.room.status);
          
          // Set room type ID
          if (data.room.roomTypeId?._id) {
            setSelectedRoomTypeId(data.room.roomTypeId._id);
            setValue('roomTypeId', data.room.roomTypeId._id);
          }
        }
      })
      .catch(() => toast.error('Failed to load room'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onSubmit = async (data: RoomForm) => {
    setIsLoading(true);
    try {
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

      const result = await updateRoom(params.id, formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Room updated successfully!');
        window.location.href = '/rooms';
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!room) {
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
          href="/rooms" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rooms</span>
        </Link>

        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Edit Room</h1>
          <p className="text-gray-400">Update room information</p>
        </div>

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
                {isLoading ? 'Updating...' : 'Update Room'}
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







