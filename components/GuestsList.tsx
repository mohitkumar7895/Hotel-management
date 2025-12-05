'use client';

import Link from 'next/link';
import { Edit, Trash2, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { deleteGuest } from '@/app/actions/guests';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Guest {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  idProof: string;
  checkIn?: Date;
  checkOut?: Date;
  roomId?: {
    roomNumber: string;
  };
  roomTypeId?: string;
}

export default function GuestsList({ guests }: { guests: Guest[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    setDeleting(id);
    try {
      const result = await deleteGuest(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Guest deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete guest');
    } finally {
      setDeleting(null);
    }
  };

  if (guests.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400 mb-4">No guests found</p>
        <Link href="/guests/new" className="text-blue-400 hover:text-blue-300">
          Add your first guest
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Contact</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Room Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Address</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Check-in</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Check-out</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-white font-medium">{guest.name}</p>
                    <p className="text-gray-400 text-xs">{guest.idProof}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Phone className="w-3 h-3" />
                      {guest.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Mail className="w-3 h-3" />
                      {guest.email}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-medium">
                    {guest.roomTypeId ? (
                      <span className="inline-block bg-blue-600/20 px-3 py-1 rounded-md text-sm border border-blue-600/30">
                        {guest.roomTypeId}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 text-sm">
                  {guest.address || '-'}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {guest.checkIn ? format(new Date(guest.checkIn), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {guest.checkOut ? format(new Date(guest.checkOut), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/guests/${guest._id}/edit`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(guest._id)}
                      disabled={deleting === guest._id}
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


