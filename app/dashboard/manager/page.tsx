'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RecentBookings from '@/components/RecentBookings';
import { Bed, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerDashboard() {
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
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

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

        // Verify manager access
        if (authData.user.role !== 'manager' && authData.user.role !== 'superadmin' && authData.user.role !== 'admin') {
          toast.error('Access denied. Manager only.');
          router.push('/dashboard');
          return;
        }

        setUser(authData.user);
        setLoading(false);

        // Fetch data (no financial data for manager)
        const [roomsRes, bookingsRes] = await Promise.allSettled([
          fetch('/api/rooms', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/bookings', { credentials: 'include', cache: 'no-store' }),
        ]);

        // Process rooms data
        if (roomsRes.status === 'fulfilled' && roomsRes.value.ok) {
          const roomsData = await roomsRes.value.json();
          if (roomsData.rooms) {
            setStats((prev) => ({
              ...prev,
              totalRooms: roomsData.rooms.length,
              occupiedRooms: roomsData.rooms.filter((r: any) => r.status === 'booked').length,
              availableRooms: roomsData.rooms.filter((r: any) => r.status === 'available').length,
              cleaningRooms: roomsData.rooms.filter((r: any) => r.status === 'cleaning').length,
            }));
          }
        }

        // Process bookings data
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value.ok) {
          const bookingsData = await bookingsRes.value.json();
          if (bookingsData.bookings) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todaysCheckIns = bookingsData.bookings.filter((b: any) => {
              const checkIn = new Date(b.checkIn);
              checkIn.setHours(0, 0, 0, 0);
              return checkIn.getTime() === today.getTime() && b.status === 'confirmed';
            }).length;

            const todaysCheckOuts = bookingsData.bookings.filter((b: any) => {
              const checkOut = new Date(b.checkOut);
              checkOut.setHours(0, 0, 0, 0);
              return checkOut.getTime() === today.getTime() && b.status === 'checked-in';
            }).length;

            setStats((prev) => ({
              ...prev,
              todaysCheckIns,
              todaysCheckOuts,
            }));
            setRecentBookings(bookingsData.bookings.slice(0, 5));
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
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
          Manager Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-400">Room assignments and daily operations</p>
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

      {recentBookings.length > 0 && (
        <div className="mt-6">
          <RecentBookings bookings={recentBookings} />
        </div>
      )}
    </div>
  );
}

