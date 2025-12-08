'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  RefreshCw,
  Bell,
  Package,
} from 'lucide-react';

interface ServiceRequest {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
  };
  guestId?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  serviceId?: {
    _id: string;
    name: string;
    category: string;
    price: number;
  };
  requestType: string;
  priority: string;
  notes?: string;
  status: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  requestedBy?: {
    _id: string;
    name: string;
  };
  completedAt?: string;
  estimatedTime?: number;
  actualTime?: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  pending: 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const PRIORITY_COLORS: { [key: string]: string } = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const REQUEST_TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'concierge', label: 'Concierge' },
  { value: 'other', label: 'Other' },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 60 seconds for live data (reduced frequency for performance)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRequests();
      }
    }, 60000);
    
    // Refresh when page becomes visible
    const handleFocus = () => {
      fetchRequests();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [statusFilter, priorityFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (typeFilter) params.append('requestType', typeFilter);

      console.log('🔄 Fetching requests...');
      const response = await fetch(`/api/requests?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Fetched ${result.requests?.length || 0} requests`);
        setRequests(result.requests || []);
        setStatistics(result.statistics);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to fetch requests:', errorData);
      }
    } catch (error) {
      console.error('❌ Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert('✅ Request status updated successfully!');
        fetchRequests();
      } else {
        const result = await response.json();
        alert(`❌ Error: ${result.error || 'Failed to update status'}`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update request status. Please check console for details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Request deleted successfully!');
        fetchRequests();
      } else {
        const result = await response.json();
        alert(`❌ Error: ${result.error || 'Failed to delete request'}`);
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
      alert('Failed to delete request. Please check console for details.');
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        req.roomId.roomNumber.toLowerCase().includes(search) ||
        req.guestId?.name.toLowerCase().includes(search) ||
        req.serviceId?.name.toLowerCase().includes(search) ||
        req.notes?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const pendingCount = statistics?.byStatus?.find((s: any) => s.status === 'pending')?.count || 0;
  const urgentCount = statistics?.byPriority?.find((p: any) => p.priority === 'urgent')?.count || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Service Requests
          </h1>
          <p className="text-gray-400">Manage guest service requests in real-time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRequests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <a
            href="/requests/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </a>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <div className="text-gray-400 text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <div className="text-gray-400 text-sm mb-1">In Progress</div>
            <div className="text-2xl font-bold text-blue-500">
              {statistics.byStatus?.find((s: any) => s.status === 'in-progress')?.count || 0}
            </div>
          </div>
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <div className="text-gray-400 text-sm mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-500">
              {statistics.byStatus?.find((s: any) => s.status === 'completed')?.count || 0}
            </div>
          </div>
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <div className="text-gray-400 text-sm mb-1">Urgent</div>
            <div className="text-2xl font-bold text-red-500">{urgentCount}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by room, guest, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            {REQUEST_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No service requests found</p>
          <a
            href="/requests/new"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create First Request
          </a>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Room</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Service/Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Assigned To</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">Room {req.roomId.roomNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      {req.guestId ? (
                        <div>
                          <div className="text-white">{req.guestId.name}</div>
                          <div className="text-gray-400 text-xs">{req.guestId.phone}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {req.serviceId ? (
                        <div>
                          <div className="text-white">{req.serviceId.name}</div>
                          <div className="text-gray-400 text-xs">{req.serviceId.category}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-white capitalize">{req.requestType}</div>
                          {req.notes && (
                            <div className="text-gray-400 text-xs truncate max-w-xs">{req.notes}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs text-white ${PRIORITY_COLORS[req.priority] || 'bg-gray-500'}`}>
                        {req.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs text-white border-0 ${STATUS_COLORS[req.status] || 'bg-gray-500'} cursor-pointer`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {req.assignedTo ? (
                        <div className="text-white text-sm">{req.assignedTo.name}</div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-300 text-sm">
                        {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {format(new Date(req.createdAt), 'HH:mm')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/requests/${req._id}/edit`}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(req._id)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
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
      )}
    </div>
  );
}
