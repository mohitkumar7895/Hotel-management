'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  X,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format } from 'date-fns';

interface DashboardData {
  summary: {
    revenue: { today: number; thisMonth: number; thisYear: number };
    expense: { today: number; thisMonth: number; thisYear: number };
    profit: { today: number; thisMonth: number; thisYear: number };
  };
  charts: {
    daily: { revenue: { [key: string]: number }; expense: { [key: string]: number } };
    revenueByCategory: Array<{ category: string; amount: number }>;
  };
  latestTransactions: Array<{
    _id: string;
    type: string;
    category: string;
    amount: number;
    date: string;
    paymentMode: string;
    description?: string;
    reference?: string;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface Payment {
  _id: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  reference?: string;
  notes?: string;
  invoiceId?: {
    invoiceNumber: string;
    guestName?: string;
    totalAmount: number;
    dueAmount: number;
  };
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  guestName?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
}

export default function AccountsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    paymentMode: 'cash',
    reference: '',
    notes: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchPayments();
    fetchPendingInvoices();
    
    // Auto-refresh every 60 seconds to show latest data (reduced frequency for performance)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
        fetchPayments();
        fetchPendingInvoices();
      }
    }, 60000);
    
    // Refresh when page becomes visible (after form submission)
    const handleFocus = () => {
      fetchDashboardData();
      fetchPayments();
      fetchPendingInvoices();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/accounts/payments?limit=5');
      if (response.ok) {
        const result = await response.json();
        setPayments(result.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const fetchPendingInvoices = async () => {
    try {
      const response = await fetch('/api/accounts/invoices?status=pending,partial');
      if (response.ok) {
        const result = await response.json();
        setPendingInvoices((result.invoices || []).filter((inv: Invoice) => inv.dueAmount > 0).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch pending invoices:', error);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setPaymentLoading(true);
    try {
      // Build request body - only include invoiceId if it's not empty
      const requestBody: any = {
        amount: parseFloat(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
      };

      // Only add invoiceId if it's provided and not empty
      if (paymentForm.invoiceId && paymentForm.invoiceId.trim() !== '') {
        requestBody.invoiceId = paymentForm.invoiceId.trim();
      }

      // Add optional fields only if they have values
      if (paymentForm.reference && paymentForm.reference.trim() !== '') {
        requestBody.reference = paymentForm.reference.trim();
      }
      if (paymentForm.notes && paymentForm.notes.trim() !== '') {
        requestBody.notes = paymentForm.notes.trim();
      }

      console.log('Submitting payment:', requestBody);

      const response = await fetch('/api/accounts/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('Payment response:', result);
      
      if (response.ok) {
        alert('✅ Payment recorded successfully to MongoDB Atlas!');
        setPaymentForm({
          invoiceId: '',
          amount: '',
          paymentMode: 'cash',
          reference: '',
          notes: '',
        });
        setShowPaymentForm(false);
        fetchDashboardData();
        fetchPayments();
        fetchPendingInvoices();
      } else {
        alert(`❌ Error: ${result.error || 'Failed to record payment'}`);
        console.error('Payment error details:', result);
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment. Please check console for details.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      const response = await fetch('/api/accounts/dashboard');
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dashboard data received:', {
          revenueToday: result.summary?.revenue?.today || 0,
          revenueThisMonth: result.summary?.revenue?.thisMonth || 0,
          expenseToday: result.summary?.expense?.today || 0,
          expenseThisMonth: result.summary?.expense?.thisMonth || 0,
          transactionsCount: result.latestTransactions?.length || 0,
        });
        
        // Show all valid transactions (both revenue and expense)
        const validTransactions = (result.latestTransactions || []).filter((t: any) => 
          t && t._id && t.amount && t.category && t.date && t.type
        );
        
        console.log(`📋 Showing ${validTransactions.length} valid transactions`);
        
        setData({
          ...result,
          latestTransactions: validTransactions,
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to fetch dashboard data:', errorData);
        setData({
          summary: {
            revenue: { today: 0, thisMonth: 0, thisYear: 0 },
            expense: { today: 0, thisMonth: 0, thisYear: 0 },
            profit: { today: 0, thisMonth: 0, thisYear: 0 },
          },
          charts: {
            daily: { revenue: {}, expense: {} },
            revenueByCategory: [],
          },
          latestTransactions: [],
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      setData({
        summary: {
          revenue: { today: 0, thisMonth: 0, thisYear: 0 },
          expense: { today: 0, thisMonth: 0, thisYear: 0 },
          profit: { today: 0, thisMonth: 0, thisYear: 0 },
        },
        charts: {
          daily: { revenue: {}, expense: {} },
          revenueByCategory: [],
        },
        latestTransactions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Accounts Dashboard</h1>
            <p className="text-gray-400">Financial overview and analytics</p>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
          <p className="text-gray-400 mb-4">No data available. Please add transactions or run seed data.</p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/accounts/revenue/new"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Revenue
            </Link>
            <Link
              href="/accounts/expenses/new"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Expense
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const dailyChartData = Object.keys({ ...data.charts.daily.revenue, ...data.charts.daily.expense })
    .sort()
    .map((date) => ({
      date: format(new Date(date), 'MMM dd'),
      revenue: data.charts.daily.revenue[date] || 0,
      expense: data.charts.daily.expense[date] || 0,
    }));

  const pieData = data.charts.revenueByCategory.map((item) => ({
    name: item.category,
    value: item.amount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Accounts Dashboard</h1>
          <p className="text-gray-400">Financial overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            className="bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Refresh Dashboard"
          >
            <ArrowUpRight className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/accounts/revenue/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Revenue
          </Link>
          <Link
            href="/accounts/expenses/new"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Link>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Revenue</h3>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(data.summary.revenue.today)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(data.summary.revenue.thisMonth)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">This Year</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(data.summary.revenue.thisYear)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Expenses</h3>
            <Receipt className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(data.summary.expense.today)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(data.summary.expense.thisMonth)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">This Year</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(data.summary.expense.thisYear)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Net Profit</h3>
            {data.summary.profit.thisMonth >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-400" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-400" />
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p
                className={`text-2xl font-bold ${
                  data.summary.profit.today >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatCurrency(data.summary.profit.today)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p
                  className={`text-lg font-semibold ${
                    data.summary.profit.thisMonth >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(data.summary.profit.thisMonth)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">This Year</p>
                <p
                  className={`text-lg font-semibold ${
                    data.summary.profit.thisYear >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(data.summary.profit.thisYear)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Line Chart */}
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Revenue vs Expenses (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
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
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                name="Expenses"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category Pie Chart */}
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Revenue by Category (This Month)</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No revenue data available
            </div>
          )}
        </div>
      </div>

      {/* Latest Transactions */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
        <div className="p-6 border-b border-[#334155] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Latest Transactions</h2>
          <Link
            href="/accounts/revenue"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Category</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Description</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {data.latestTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                data.latestTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b border-[#334155] hover:bg-[#0f172a] transition-colors"
                  >
                    <td className="py-3 px-6 text-gray-300">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'revenue'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-300">{transaction.category}</td>
                    <td className="py-3 px-6 text-gray-300">
                      {transaction.description || transaction.reference || '-'}
                    </td>
                    <td
                      className={`py-3 px-6 font-medium ${
                        transaction.type === 'revenue' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {transaction.type === 'revenue' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-6 text-gray-300 capitalize">
                      {transaction.paymentMode}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Payment Form */}
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Quick Payment</h2>
            {!showPaymentForm ? (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Record Payment
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setPaymentForm({
                    invoiceId: '',
                    amount: '',
                    paymentMode: 'cash',
                    reference: '',
                    notes: '',
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {showPaymentForm && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Invoice (Optional)
                </label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, invoiceId: e.target.value });
                    if (e.target.value) {
                      const invoice = pendingInvoices.find(inv => inv._id === e.target.value);
                      if (invoice) {
                        setPaymentForm(prev => ({ ...prev, amount: invoice.dueAmount.toString() }));
                      }
                    }
                  }}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">No Invoice (Direct Payment)</option>
                  {pendingInvoices.map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} - Due: {formatCurrency(invoice.dueAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Payment Mode <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Reference</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                  placeholder="Transaction ID, Check No, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                  placeholder="Additional notes..."
                />
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {paymentLoading ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          )}

          {!showPaymentForm && (
            <div className="text-center py-8 text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click &quot;Record Payment&quot; to add a new payment</p>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Payments</h2>
            <Link
              href="/accounts/invoices"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No payments recorded yet</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment._id}
                  className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.invoiceId && (
                        <p className="text-gray-400 text-sm">
                          Invoice: {payment.invoiceId.invoiceNumber}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs capitalize">
                      {payment.paymentMode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                    {payment.reference && (
                      <span className="text-xs">Ref: {payment.reference}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Pending Payments</h2>
            <Link
              href="/accounts/invoices"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Invoice #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Paid</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Due</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                    <td className="py-3 px-4 text-white">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-300">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="py-3 px-4 text-green-400">{formatCurrency(invoice.paidAmount)}</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">{formatCurrency(invoice.dueAmount)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        invoice.paymentStatus === 'paid' 
                          ? 'bg-green-500/20 text-green-400'
                          : invoice.paymentStatus === 'partial'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/accounts/invoices/${invoice._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View & Pay
                      </Link>
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
