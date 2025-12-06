'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const REVENUE_CATEGORIES = [
  'Room Booking',
  'Restaurant',
  'Spa',
  'Laundry',
  'Banquet',
  'Taxes',
  'Others',
];

const PAYMENT_MODES = ['cash', 'card', 'upi', 'netbanking'];

export default function NewRevenuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash',
    description: '',
    reference: '',
    bookingId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category || !formData.amount || !formData.date || !formData.paymentMode) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting revenue form:', formData);
      
      const response = await fetch('/api/accounts/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          date: formData.date,
          paymentMode: formData.paymentMode,
          description: formData.description?.trim() || undefined,
          reference: formData.reference?.trim() || undefined,
          bookingId: formData.bookingId?.trim() || undefined,
        }),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.transaction) {
        // Success - redirect and show message
        alert('✅ Revenue entry saved successfully to MongoDB Atlas!');
        // Clear form
        setFormData({
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentMode: 'cash',
          description: '',
          reference: '',
          bookingId: '',
        });
        // Navigate to revenue page
        router.push('/accounts/revenue');
        // Force refresh after a small delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const errorMsg = result.error || 'Failed to create revenue entry';
        alert(`❌ Error: ${errorMsg}`);
        console.error('Error response:', result);
      }
    } catch (error) {
      console.error('Failed to create revenue:', error);
      alert('Failed to create revenue entry. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts/revenue"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Add Revenue Entry</h1>
          <p className="text-gray-400">Record a new revenue transaction</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {REVENUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Payment Mode <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Booking ID, Service ID, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Booking ID</label>
              <input
                type="text"
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Additional details..."
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#334155]">
            <Link
              href="/accounts/revenue"
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Revenue Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

