'use client';

import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteRoom, updateRoomStatus } from '@/app/actions/rooms';
import toast from 'react-hot-toast';

interface Room {
  _id: string;
  roomNumber: string;
  roomTypeId: {
    _id: string;
    name: string;
    price: number;
  };
  floor: number;
  status: 'available' | 'booked' | 'cleaning' | 'maintenance';
}

interface RoomType {
  _id: string;
  name: string;
}

export default function RoomsList({ rooms, roomTypes }: { rooms: Room[]; roomTypes: RoomType[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    setDeleting(id);
    try {
      const result = await deleteRoom(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Room deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete room');
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const result = await updateRoomStatus(id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Room status updated');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'booked':
        return 'bg-red-500/20 text-red-400';
      case 'cleaning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'maintenance':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (rooms.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400 mb-4">No rooms found</p>
        <Link href="/rooms/new" className="text-blue-400 hover:text-blue-300">
          Create your first room
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Room Number</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Room Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Floor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                <td className="py-3 px-4 text-white font-medium">{room.roomNumber}</td>
                <td className="py-3 px-4 text-gray-300">{room.roomTypeId.name}</td>
                <td className="py-3 px-4 text-gray-300">Floor {room.floor}</td>
                <td className="py-3 px-4">
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room._id, e.target.value)}
                    disabled={updating === room._id}
                    className={`px-3 py-1 rounded text-xs font-medium border-0 ${getStatusColor(
                      room.status
                    )} bg-transparent cursor-pointer`}
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/rooms/${room._id}/edit`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(room._id)}
                      disabled={deleting === room._id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
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
  );
}





