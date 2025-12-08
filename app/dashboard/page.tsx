'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RecentBookings from '@/components/RecentBookings';
import { Bed, Users, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    cleaningRooms: 0,
    todaysCheckIns: 0,
    todaysCheckOuts: 0,
    monthlyRevenue: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    // Check authentication first
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          toast.error('Please login to continue');
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
          return;
        }

        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setLoading(false); // Set loading to false once user is fetched
        } else {
          toast.error('User data not found');
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
          return;
        }

        // Fetch rooms data after authentication
        fetch('/api/rooms', {
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.rooms) {
              const totalRooms = data.rooms.length;
              const occupiedRooms = data.rooms.filter((r: any) => r.status === 'booked').length;
              const availableRooms = data.rooms.filter((r: any) => r.status === 'available').length;
              const cleaningRooms = data.rooms.filter((r: any) => r.status === 'cleaning').length;

              setStats((prev) => ({
                ...prev,
                totalRooms,
                occupiedRooms,
                availableRooms,
                cleaningRooms,
              }));
            }
          })
          .catch((err) => {
            console.error('Error fetching rooms:', err);
          });

        // Fetch bookings data after authentication
        fetch('/api/bookings', {
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.bookings) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const todaysCheckIns = data.bookings.filter((b: any) => {
                const checkIn = new Date(b.checkIn);
                checkIn.setHours(0, 0, 0, 0);
                return checkIn.getTime() === today.getTime() && b.status !== 'cancelled';
              }).length;

              const todaysCheckOuts = data.bookings.filter((b: any) => {
                const checkOut = new Date(b.checkOut);
                checkOut.setHours(0, 0, 0, 0);
                return checkOut.getTime() === today.getTime() && b.status !== 'cancelled';
              }).length;

              const currentMonth = new Date().getMonth();
              const currentYear = new Date().getFullYear();
              const monthlyRevenue = data.bookings
                .filter((b: any) => {
                  const bookingDate = new Date(b.createdAt);
                  return (
                    bookingDate.getMonth() === currentMonth &&
                    bookingDate.getFullYear() === currentYear &&
                    b.status !== 'cancelled'
                  );
                })
                .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

              setStats((prev) => ({
                ...prev,
                todaysCheckIns,
                todaysCheckOuts,
                monthlyRevenue,
              }));

              // Set recent bookings (last 5)
              setRecentBookings(data.bookings.slice(0, 5));
            }
          })
          .catch((err) => {
            console.error('Error fetching bookings:', err);
          });

        // Fetch live revenue data from accounts dashboard API
        fetch('/api/accounts/dashboard', {
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.summary) {
              setStats((prev) => ({
                ...prev,
                revenueToday: data.summary.revenue.today || 0,
                revenueThisMonth: data.summary.revenue.thisMonth || 0,
                revenueThisYear: data.summary.revenue.thisYear || 0,
              }));
            }
          })
          .catch((err) => {
            console.error('Error fetching revenue:', err);
          });
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication failed');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }
    };

    checkAuth();

    // Auto-refresh revenue data every 60 seconds
    const revenueInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetch('/api/accounts/dashboard', {
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.summary) {
              setStats((prev) => ({
                ...prev,
                revenueToday: data.summary.revenue.today || 0,
                revenueThisMonth: data.summary.revenue.thisMonth || 0,
                revenueThisYear: data.summary.revenue.thisYear || 0,
              }));
            }
          })
          .catch((err) => {
            console.error('Error refreshing revenue:', err);
          });
      }
    }, 60000);

    return () => {
      clearInterval(revenueInterval);
    };
  }, [router]);

  // Show loading while checking authentication
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }


  const statCards = [
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      title: 'Occupied',
      value: stats.occupiedRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-red-600',
    },
    {
      title: 'Available',
      value: stats.availableRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-green-600',
    },
    {
      title: 'Cleaning',
      value: stats.cleaningRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-yellow-600',
    },
    {
      title: "Today's Check-ins",
      value: stats.todaysCheckIns,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-purple-600',
    },
    {
      title: "Today's Check-outs",
      value: stats.todaysCheckOuts,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-600',
    },
    {
      title: 'Revenue Today',
      value: `$${stats.revenueToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-600',
    },
    {
      title: 'Revenue This Month',
      value: `$${stats.revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-emerald-600',
    },
    {
      title: 'Revenue This Year',
      value: `$${stats.revenueThisYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-teal-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.name || 'User'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1e293b] rounded-lg p-6 border border-[#334155] hover:border-[#475569] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {recentBookings.length > 0 && (
        <div className="mt-6">
          <RecentBookings bookings={recentBookings} />
        </div>
      )}
    </div>
  );
}
