'use client';

import Link from 'next/link';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { deleteRoomType } from '@/app/actions/roomTypes';
import toast from 'react-hot-toast';

interface RoomType {
  _id: string;
  name: string;
  description: string;
  price: number;
  amenities: string[];
  maxGuests: number;
  image?: string;
}

export default function RoomTypesList({ roomTypes }: { roomTypes: RoomType[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room type?')) return;

    setDeleting(id);
    try {
      const result = await deleteRoomType(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Room type deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete room type');
    } finally {
      setDeleting(null);
    }
  };

  if (roomTypes.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400 mb-4">No room types found</p>
        <Link
          href="/room-types/new"
          className="text-blue-400 hover:text-blue-300"
        >
          Create your first room type
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Image</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Description</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Price/Night</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Max Guests</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amenities</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map((roomType) => (
              <tr key={roomType._id} className="border-b border-[#334155] hover:bg-[#0f172a] transition-colors">
                <td className="py-3 px-4">
                  {roomType.image ? (
                    <img
                      src={roomType.image}
                      alt={roomType.name}
                      className="w-16 h-16 object-cover rounded-lg border border-[#334155]"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#0f172a] flex items-center justify-center rounded-lg border border-[#334155]">
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <p className="text-white font-medium">{roomType.name}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-gray-300 text-sm max-w-xs line-clamp-2">{roomType.description}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-blue-400 font-semibold">${roomType.price}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-300">{roomType.maxGuests}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {roomType.amenities && roomType.amenities.length > 0 ? (
                      roomType.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs"
                        >
                          {amenity.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                    {roomType.amenities && roomType.amenities.length > 3 && (
                      <span className="text-gray-400 text-xs">+{roomType.amenities.length - 3} more</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/room-types/${roomType._id}/edit`}
                      className="bg-[#334155] hover:bg-[#475569] text-white px-3 py-1.5 rounded-lg text-sm transition-colors inline-flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(roomType._id)}
                      disabled={deleting === roomType._id}
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleting === roomType._id ? 'Deleting...' : 'Delete'}
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


