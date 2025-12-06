'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EXPENSE_CATEGORIES = [
  'Salaries',
  'Inventory',
  'Utilities',
  'Maintenance',
  'Vendor Payments',
  'Marketing',
  'Others',
];

const PAYMENT_MODES = ['cash', 'card', 'upi', 'netbanking'];

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<Array<{ _id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash',
    description: '',
    reference: '',
    vendorId: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/accounts/vendors');
      if (response.ok) {
        const result = await response.json();
        setVendors(result.vendors || []);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

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
      console.log('Submitting expense form:', formData);
      
      const response = await fetch('/api/accounts/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          date: formData.date,
          paymentMode: formData.paymentMode,
          description: formData.description?.trim() || undefined,
          reference: formData.reference?.trim() || undefined,
          vendorId: formData.vendorId?.trim() || undefined,
        }),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.transaction) {
        // Success - redirect and show message
        alert('✅ Expense entry saved successfully to MongoDB Atlas!');
        // Clear form
        setFormData({
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentMode: 'cash',
          description: '',
          reference: '',
          vendorId: '',
        });
        // Navigate to expenses page
        router.push('/accounts/expenses');
        // Force refresh after a small delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const errorMsg = result.error || 'Failed to create expense entry';
        alert(`❌ Error: ${errorMsg}`);
        console.error('Error response:', result);
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
      alert('Failed to create expense entry. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts/expenses"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Add Expense Entry</h1>
          <p className="text-gray-400">Record a new expense transaction</p>
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
                {EXPENSE_CATEGORIES.map((cat) => (
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
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Vendor <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">No Vendor (Optional)</option>
                {vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No vendors available</option>
                )}
              </select>
              {vendors.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No vendors found. You can add vendors from the Vendors page.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Invoice number, etc."
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
              href="/accounts/expenses"
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Expense Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

