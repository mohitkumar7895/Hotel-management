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

export default function AccountsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds to show latest data
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Refresh when page becomes visible (after form submission)
    const handleFocus = () => {
      fetchDashboardData();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
    </div>
  );
}
