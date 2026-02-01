'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenueToday: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0,
    pendingPayments: 0,
    totalInvoices: 0,
    paidInvoices: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const authResponse = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!authResponse.ok) {
          toast.error('Please login to continue');
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
          return;
        }

        const authData = await authResponse.json();
        if (!authData.user) {
          toast.error('User data not found');
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
          return;
        }

        // Verify accountant access
        if (authData.user.role !== 'accountant' && authData.user.role !== 'superadmin' && authData.user.role !== 'admin') {
          toast.error('Access denied. Accountant only.');
          router.push('/dashboard');
          return;
        }

        setUser(authData.user);
        setLoading(false);

        // Fetch financial data only
        const [revenueRes, paymentsRes] = await Promise.allSettled([
          fetch('/api/accounts/dashboard', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/accounts/payments', { credentials: 'include', cache: 'no-store' }),
        ]);

        // Process revenue data
        if (revenueRes.status === 'fulfilled' && revenueRes.value.ok) {
          const revenueData = await revenueRes.value.json();
          if (revenueData.summary) {
            setStats((prev) => ({
              ...prev,
              revenueToday: revenueData.summary.revenue.today || 0,
              revenueThisMonth: revenueData.summary.revenue.thisMonth || 0,
              revenueThisYear: revenueData.summary.revenue.thisYear || 0,
            }));
          }
        }

        // Process payments data
        if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
          const paymentsData = await paymentsRes.value.json();
          if (paymentsData.payments) {
            const pending = paymentsData.payments.filter((p: any) => p.status === 'pending').length;
            setStats((prev) => ({
              ...prev,
              pendingPayments: pending,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    loadDashboardData();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Revenue Today',
      value: `$${stats.revenueToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-600',
    },
    {
      title: 'Revenue This Month',
      value: `$${stats.revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-emerald-600',
    },
    {
      title: 'Revenue This Year',
      value: `$${stats.revenueThisYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-teal-600',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-yellow-600',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
          Accountant Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-400">Financial management and billing</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1e293b] rounded-lg p-4 sm:p-5 md:p-6 border border-[#334155] hover:border-[#475569] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">{stat.title}</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6">{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


