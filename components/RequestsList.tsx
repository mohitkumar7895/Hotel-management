'use client';

import { useState } from 'react';
import { updateRequestStatus } from '@/app/actions/requests';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ServiceRequest {
  _id: string;
  roomId: {
    roomNumber: string;
  };
  serviceId: {
    name: string;
    price: number;
  };
  notes?: string;
  status: string;
  createdAt: Date;
}

export default function RequestsList({ requests }: { requests: ServiceRequest[] }) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const result = await updateRequestStatus(id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Request status updated');
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
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400">No service requests found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Room</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Service</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Notes</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                <td className="py-3 px-4 text-white">{request.roomId.roomNumber}</td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-white">{request.serviceId.name}</p>
                    <p className="text-gray-400 text-xs">${request.serviceId.price}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">{request.notes || '-'}</td>
                <td className="py-3 px-4 text-gray-300">
                  {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={request.status}
                    onChange={(e) => handleStatusChange(request._id, e.target.value)}
                    disabled={updating === request._id}
                    className={`px-3 py-1 rounded text-xs font-medium border-0 ${getStatusColor(
                      request.status
                    )} bg-transparent cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}








