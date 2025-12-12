'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'spa', label: 'Spa & Wellness' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'transport', label: 'Transport' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'business', label: 'Business' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'other', label: 'Other' },
];

const UNITS = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_item', label: 'Per Item' },
  { value: 'per_service', label: 'Per Service' },
];

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    price: '',
    unit: 'fixed',
    description: '',
    duration: '',
    isAvailable: true,
    requiresBooking: false,
    maxCapacity: '',
    icon: '',
    image: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.price) < 0) {
      alert('Price must be greater than or equal to 0');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/extra-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.service) {
        alert('✅ Service created successfully!');
        router.push('/extra-services');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert(`❌ Error: ${result.error || 'Failed to create service'}`);
      }
    } catch (error) {
      console.error('Failed to create service:', error);
      alert('Failed to create service. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/extra-services"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Add New Service</h1>
          <p className="text-gray-400">Create a new extra service for guests</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-lg border border-[#334155] p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Spa Massage, Laundry Service"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pricing Unit
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Describe the service..."
            />
          </div>
        </div>

        {/* Service Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Service Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., 60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Capacity
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-[#0f172a] border-[#334155] rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">Service is Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresBooking}
                onChange={(e) => setFormData({ ...formData, requiresBooking: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-[#0f172a] border-[#334155] rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">Requires Booking</span>
            </label>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-2">
            Optional Fields
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icon (emoji or character)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., 💆 or S"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4 border-t border-[#334155]">
          <Link
            href="/extra-services"
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
}



