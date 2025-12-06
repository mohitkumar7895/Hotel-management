'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Plus, Filter, Edit, Trash2, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExpenseTransaction {
  _id: string;
  category: string;
  amount: number;
  date: string;
  paymentMode: string;
  description?: string;
  reference?: string;
  vendorId?: any;
  createdBy?: any;
}

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<Array<{ month: string; total: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    vendorId: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);

      const response = await fetch(`/api/accounts/expenses?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.transactions);
        setCategories(result.categories || []);
        setMonthlyExpenses(result.monthlyExpenses || []);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;

    try {
      const response = await fetch(`/api/accounts/expenses/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchExpenses();
      } else {
        alert('Failed to delete expense entry');
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense entry');
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      if (transactions.length === 0) {
        alert('No data to export. Please add expense entries first.');
        return;
      }

      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      params.append('format', format);

      console.log('📥 Exporting expense data...', { format, filters });

      const response = await fetch(`/api/accounts/expenses/export?${params.toString()}`);
      
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const dateStr = new Date().toISOString().split('T')[0];
          a.download = `expenses-export-${dateStr}.csv`;
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
      console.error('Failed to export expenses:', error);
      alert('Failed to export expense data. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Expense Management</h1>
          <p className="text-gray-400">Track and manage all expenses</p>
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
            onClick={() => handleExport('csv')}
            className="bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            href="/accounts/expenses/new"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
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
                onClick={() => setFilters({ category: '', startDate: '', endDate: '', vendorId: '' })}
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
            <p className="text-gray-400 text-sm mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
            <p className="text-gray-400 text-sm mt-1">{transactions.length} entries</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {monthlyExpenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Monthly Expenses (Line)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                  dot={{ fill: '#ef4444', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Monthly Expenses (Bar)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="total" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Category</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Vendor</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Description</th>
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
                    No expense entries found
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
                      {transaction.vendorId?.name || '-'}
                    </td>
                    <td className="py-3 px-6 text-gray-300">
                      {transaction.description || '-'}
                    </td>
                    <td className="py-3 px-6 text-gray-300 capitalize">
                      {transaction.paymentMode}
                    </td>
                    <td className="py-3 px-6 font-medium text-red-400">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/accounts/expenses/${transaction._id}/edit`}
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

