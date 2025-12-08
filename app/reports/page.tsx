'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import {
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Bed,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

interface ReportsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  financial?: {
    revenue: {
      total: number;
      count: number;
      byCategory: Array<{ category: string; amount: number; count: number }>;
      byPaymentMode: Array<{ mode: string; amount: number; count: number }>;
      daily: Array<{ date: string; amount: number; count: number }>;
    };
    expenses: {
      total: number;
      count: number;
      byCategory: Array<{ category: string; amount: number; count: number }>;
      daily: Array<{ date: string; amount: number; count: number }>;
    };
    profit: {
      total: number;
    };
  };
  occupancy?: {
    totalRooms: number;
    availableRooms: number;
    bookedRooms: number;
    maintenanceRooms: number;
    occupancyRate: number;
    bookingsInRange: number;
    checkIns: number;
    checkOuts: number;
    byRoomType: Array<{ roomType: string; bookings: number; revenue: number }>;
  };
  bookings?: {
    total: number;
    list: any[];
    byStatus: Array<{ status: string; count: number; revenue: number }>;
    byPaymentStatus: Array<{ status: string; count: number; revenue: number }>;
  };
  services?: {
    total: number;
    totalRevenue: number;
    list: any[];
    byStatus: Array<{ status: string; count: number; revenue: number }>;
    byCategory: Array<{ category: string; count: number; revenue: number }>;
  };
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportsData | null>(null);
  const [reportType, setReportType] = useState('all');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReports();
    
    // Auto-refresh every 60 seconds for live data (reduced frequency for performance)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchReports();
      }
    }, 60000);
    
    // Refresh when page becomes visible
    const handleFocus = () => {
      fetchReports();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reportType, period, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', reportType);
      params.append('period', period);
      if (period === 'custom' && startDate) params.append('startDate', startDate);
      if (period === 'custom' && endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportFormat: 'csv' | 'pdf') => {
    if (!data) return;

    try {
      // Create CSV content
      let csvContent = '';

      if (data.financial) {
        csvContent += 'Financial Report\n';
        csvContent += `Period: ${period}\n`;
        csvContent += `Date Range: ${format(new Date(data.dateRange.start), 'MMM dd, yyyy')} - ${format(new Date(data.dateRange.end), 'MMM dd, yyyy')}\n\n`;
        csvContent += 'Revenue Summary\n';
        csvContent += `Total Revenue,${data.financial.revenue.total}\n`;
        csvContent += `Total Expenses,${data.financial.expenses.total}\n`;
        csvContent += `Net Profit,${data.financial.profit.total}\n\n`;
        csvContent += 'Revenue by Category\n';
        csvContent += 'Category,Amount,Count\n';
        data.financial.revenue.byCategory.forEach((item) => {
          csvContent += `${item.category},${item.amount},${item.count}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('✅ Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading reports...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Live financial, occupancy, and booking reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Reports</option>
              <option value="financial">Financial</option>
              <option value="occupancy">Occupancy</option>
              <option value="bookings">Bookings</option>
              <option value="services">Services</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <Calendar className="w-4 h-4 inline mr-2" />
          {format(new Date(data.dateRange.start), 'MMM dd, yyyy')} - {format(new Date(data.dateRange.end), 'MMM dd, yyyy')}
        </div>
      </div>

      {/* Financial Reports */}
      {(reportType === 'all' || reportType === 'financial') && data.financial && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Reports
          </h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Revenue</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-white">{formatCurrency(data.financial.revenue.total)}</div>
              <div className="text-sm text-gray-400 mt-1">{data.financial.revenue.count} transactions</div>
            </div>

            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Expenses</span>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-white">{formatCurrency(data.financial.expenses.total)}</div>
              <div className="text-sm text-gray-400 mt-1">{data.financial.expenses.count} transactions</div>
            </div>

            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Net Profit</span>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className={`text-2xl font-bold ${data.financial.profit.total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(data.financial.profit.total)}
              </div>
              <div className="text-sm text-gray-400 mt-1">Revenue - Expenses</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Revenue vs Expenses */}
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.financial.revenue.daily.map((item, idx) => ({
                  date: format(new Date(item.date), 'MMM dd'),
                  revenue: item.amount,
                  expenses: data.financial?.expenses.daily[idx]?.amount || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Category */}
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={data.financial.revenue.byCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.financial.revenue.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Payment Mode */}
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue by Payment Mode</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.financial.revenue.byPaymentMode}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mode" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Occupancy Reports */}
      {(reportType === 'all' || reportType === 'occupancy') && data.occupancy && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bed className="w-5 h-5" />
            Occupancy Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Total Rooms</div>
              <div className="text-2xl font-bold text-white">{data.occupancy.totalRooms}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Available</div>
              <div className="text-2xl font-bold text-green-500">{data.occupancy.availableRooms}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Booked</div>
              <div className="text-2xl font-bold text-yellow-500">{data.occupancy.bookedRooms}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Occupancy Rate</div>
              <div className="text-2xl font-bold text-blue-500">{data.occupancy.occupancyRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Bookings in Range</div>
              <div className="text-2xl font-bold text-white">{data.occupancy.bookingsInRange}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Check-ins</div>
              <div className="text-2xl font-bold text-green-500">{data.occupancy.checkIns}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Check-outs</div>
              <div className="text-2xl font-bold text-blue-500">{data.occupancy.checkOuts}</div>
            </div>
          </div>

          {data.occupancy.byRoomType.length > 0 && (
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Occupancy by Room Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.occupancy.byRoomType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="roomType" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Booking Reports */}
      {(reportType === 'all' || reportType === 'bookings') && data.bookings && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Booking Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Total Bookings</div>
              <div className="text-2xl font-bold text-white">{data.bookings.total}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(data.bookings.list.reduce((sum, b) => sum + (b.totalAmount || 0), 0))}
              </div>
            </div>
          </div>

          {data.bookings.byStatus.length > 0 && (
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Bookings by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.bookings.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="status" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Count" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Service Reports */}
      {(reportType === 'all' || reportType === 'services') && data.services && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Service Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Total Service Bookings</div>
              <div className="text-2xl font-bold text-white">{data.services.total}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <div className="text-gray-400 text-sm mb-2">Service Revenue</div>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(data.services.totalRevenue)}</div>
            </div>
          </div>

          {data.services.byCategory.length > 0 && (
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Services by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.services.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="category" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Bookings" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
