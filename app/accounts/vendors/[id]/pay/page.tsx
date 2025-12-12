'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { ArrowLeft, DollarSign } from 'lucide-react';

export default function VendorPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMode: 'cash',
    reference: '',
    description: '',
  });

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/accounts/vendors/${id}`);
      if (response.ok) {
        const result = await response.json();
        setVendor(result.vendor);
        setFormData((prev) => ({
          ...prev,
          amount: result.vendor.outstandingBalance.toString(),
          description: `Payment to ${result.vendor.name}`,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > vendor.outstandingBalance) {
      alert('Invalid payment amount');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/accounts/vendors/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount,
        }),
      });

      if (response.ok) {
        router.push('/accounts/vendors');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts/vendors"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Record Payment</h1>
          <p className="text-gray-400">Record payment to {vendor.name}</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <div className="mb-6 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Outstanding Balance:</span>
            <span className="text-2xl font-bold text-red-400">
              {formatCurrency(vendor.outstandingBalance)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Payment Amount (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="0.01"
                max={vendor.outstandingBalance}
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder={`Max: ${formatCurrency(vendor.outstandingBalance)}`}
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
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Transaction reference"
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
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#334155]">
            <Link
              href="/accounts/vendors"
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign className="w-4 h-4" />
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



