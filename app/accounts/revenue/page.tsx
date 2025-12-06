'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Plus, Search, Download, Edit, Trash2, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RevenueTransaction {
  _id: string;
  category: string;
  amount: number;
  date: string;
  paymentMode: string;
  description?: string;
  reference?: string;
  bookingId?: any;
  createdBy?: any;
}

export default function RevenuePage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    paymentStatus: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRevenue();
  }, [filters]);

  // Refresh data when page becomes visible (after form submission)
  useEffect(() => {
    const handleFocus = () => {
      fetchRevenue();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/accounts/revenue?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.transactions || []);
        setCategories(result.categories || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch revenue:', errorData);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this revenue entry?')) return;

    try {
      const response = await fetch(`/api/accounts/revenue/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchRevenue();
      } else {
        alert('Failed to delete revenue entry');
      }
    } catch (error) {
      console.error('Failed to delete revenue:', error);
      alert('Failed to delete revenue entry');
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      if (transactions.length === 0) {
        alert('No data to export. Please add revenue entries first.');
        return;
      }

      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('format', format);

      console.log('📥 Exporting revenue data...', { format, filters });

      const response = await fetch(`/api/accounts/revenue/export?${params.toString()}`);
      
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const dateStr = new Date().toISOString().split('T')[0];
          a.download = `revenue-export-${dateStr}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          alert(`✅ CSV exported successfully! ${transactions.length} entries exported.`);
        } else {
          // PDF export (future implementation)
          alert('PDF export coming soon!');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Export error:', errorData);
        alert(`Failed to export: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to export revenue:', error);
      alert('Failed to export revenue data. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Revenue Management</h1>
          <p className="text-gray-400">Track and manage all revenue sources</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={async () => {
              const confirmed = confirm(
                '⚠️ WARNING: This will delete ALL test/seed data!\n\n' +
                'This includes:\n' +
                '• All entries with "service revenue" in description\n' +
                '• All entries with lowercase categories (food, rooms, spa, etc.)\n' +
                '• All entries with "bank_transfer" payment mode\n' +
                '• All invoices, payments, and vendors\n\n' +
                'This action CANNOT be undone. Continue?'
              );
              
              if (!confirmed) return;

              try {
                setLoading(true);
                console.log('🗑️ Deleting test data...');
                
                const response = await fetch('/api/accounts/clear-test-data', { 
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                console.log('📡 Response status:', response.status);
                const result = await response.json();
                console.log('📦 Response data:', result);
                
                if (response.ok && result.success) {
                  const breakdown = result.breakdown || {};
                  const message = 
                    `✅ Successfully deleted ${result.deletedCount} test data entries!\n\n` +
                    `Breakdown:\n` +
                    `• By Description: ${breakdown.byDescription || 0}\n` +
                    `• By Category: ${breakdown.byCategory || 0}\n` +
                    `• By Payment Mode: ${breakdown.byPaymentMode || 0}\n` +
                    `• Empty Descriptions: ${breakdown.byEmptyDesc || 0}\n` +
                    `• Invoices: ${breakdown.invoices || 0}\n` +
                    `• Payments: ${breakdown.payments || 0}\n` +
                    `• Vendors: ${breakdown.vendors || 0}`;
                  
                  alert(message);
                  
                  // Refresh the data immediately
                  await fetchRevenue();
                  
                  // Force page reload after a short delay
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                } else {
                  const errorMsg = result.error || 'Unknown error occurred';
                  alert(`❌ Failed to delete test data:\n${errorMsg}`);
                  console.error('❌ Error details:', result);
                }
              } catch (error: any) {
                console.error('❌ Failed to delete test data:', error);
                alert(`❌ Network error: ${error.message || 'Check console for details'}`);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Deleting...' : 'Clear Test Data'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            href="/accounts/revenue/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Revenue
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', startDate: '', endDate: '', paymentStatus: '' })}
                className="w-full bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
            <p className="text-gray-400 text-sm mt-1">{transactions.length} entries</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Category</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Description</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Reference</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Payment Mode</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No revenue entries found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b border-[#334155] hover:bg-[#0f172a] transition-colors"
                  >
                    <td className="py-3 px-6 text-gray-300">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-6 text-gray-300">{transaction.category}</td>
                    <td className="py-3 px-6 text-gray-300">
                      {transaction.description || '-'}
                    </td>
                    <td className="py-3 px-6 text-gray-300">
                      {transaction.reference || '-'}
                    </td>
                    <td className="py-3 px-6 text-gray-300 capitalize">
                      {transaction.paymentMode}
                    </td>
                    <td className="py-3 px-6 font-medium text-green-400">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/accounts/revenue/${transaction._id}/edit`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

