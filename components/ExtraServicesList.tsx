'use client';

import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteExtraService } from '@/app/actions/extraServices';
import toast from 'react-hot-toast';

interface ExtraService {
  _id: string;
  name: string;
  price: number;
  icon?: string;
  description?: string;
}

export default function ExtraServicesList({ services }: { services: ExtraService[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setDeleting(id);
    try {
      const result = await deleteExtraService(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Service deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(null);
    }
  };

  if (services.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400 mb-4">No services found</p>
        <Link href="/extra-services/new" className="text-blue-400 hover:text-blue-300">
          Add your first service
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Service Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Description</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                <td className="py-3 px-4 text-white font-medium">{service.name}</td>
                <td className="py-3 px-4 text-gray-300">{service.description || '-'}</td>
                <td className="py-3 px-4 text-white">${service.price.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/extra-services/${service._id}/edit`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(service._id)}
                      disabled={deleting === service._id}
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



