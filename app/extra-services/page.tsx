'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
} from 'lucide-react';

interface ExtraService {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description?: string;
  duration?: number;
  isAvailable: boolean;
  requiresBooking: boolean;
  maxCapacity?: number;
  icon?: string;
  image?: string;
}

const CATEGORIES = [
  { value: 'spa', label: 'Spa & Wellness', color: 'bg-purple-500' },
  { value: 'laundry', label: 'Laundry', color: 'bg-blue-500' },
  { value: 'restaurant', label: 'Restaurant', color: 'bg-orange-500' },
  { value: 'transport', label: 'Transport', color: 'bg-green-500' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-pink-500' },
  { value: 'business', label: 'Business', color: 'bg-indigo-500' },
  { value: 'wellness', label: 'Wellness', color: 'bg-teal-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

const UNIT_LABELS: { [key: string]: string } = {
  per_hour: 'Per Hour',
  per_day: 'Per Day',
  per_item: 'Per Item',
  per_service: 'Per Service',
  fixed: 'Fixed Price',
};

export default function ExtraServicesPage() {
  const [services, setServices] = useState<ExtraService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  useEffect(() => {
    fetchServices();
  }, [categoryFilter, availabilityFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (availabilityFilter) params.append('isAvailable', availabilityFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/extra-services?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setServices(result.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/extra-services/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Service deleted successfully!');
        fetchServices();
      } else {
        const result = await response.json();
        alert(`❌ Error: ${result.error || 'Failed to delete service'}`);
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Failed to delete service. Please check console for details.');
    }
  };

  const filteredServices = services.filter((service) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        service.name.toLowerCase().includes(search) ||
        service.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Extra Services</h1>
          <p className="text-gray-400">Manage additional services offered to guests</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/extra-services/bookings"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Service Bookings
          </Link>
          <Link
            href="/extra-services/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Services</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No services found</p>
          <Link
            href="/extra-services/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add First Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const categoryInfo = getCategoryInfo(service.category);
            return (
              <div
                key={service._id}
                className="bg-[#1e293b] rounded-lg border border-[#334155] p-6 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${categoryInfo.color} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold`}>
                      {service.icon || service.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${categoryInfo.color} text-white`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                  {service.isAvailable ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {service.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(service.price)} {UNIT_LABELS[service.unit] || service.unit}
                    </span>
                  </div>
                  {service.duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration} minutes
                      </span>
                    </div>
                  )}
                  {service.requiresBooking && (
                    <div className="text-xs text-yellow-400">Requires Booking</div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#334155]">
                  <Link
                    href={`/extra-services/${service._id}/edit`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-center text-sm flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
