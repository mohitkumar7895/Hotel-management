'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bed, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedRooms: 0,
    cleanedRooms: 0,
    pendingRooms: 0,
    inProgressRooms: 0,
  });
  const [assignedRooms, setAssignedRooms] = useState<any[]>([]);

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

        // Verify staff access - USER role should not access this
        if (authData.user.role === 'USER') {
          window.location.href = '/my-bookings';
          return;
        }
        if (authData.user.role !== 'staff' && authData.user.role !== 'superadmin' && authData.user.role !== 'admin' && authData.user.role !== 'manager') {
          toast.error('Access denied. Staff only.');
          router.push('/dashboard');
          return;
        }

        setUser(authData.user);
        setLoading(false);

        // Fetch rooms data (staff can only see assigned rooms)
        const roomsRes = await fetch('/api/rooms', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          if (roomsData.rooms) {
            // Filter rooms that need cleaning or are assigned to staff
            const cleaningRooms = roomsData.rooms.filter((r: any) => r.status === 'cleaning');
            const cleanedRooms = roomsData.rooms.filter((r: any) => r.status === 'available' && r.lastCleaned);
            
            setStats({
              assignedRooms: cleaningRooms.length,
              cleanedRooms: cleanedRooms.length,
              pendingRooms: cleaningRooms.filter((r: any) => !r.lastCleaned).length,
              inProgressRooms: cleaningRooms.filter((r: any) => r.lastCleaned).length,
            });
            
            setAssignedRooms(cleaningRooms.slice(0, 10));
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
      title: 'Assigned Rooms',
      value: stats.assignedRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      title: 'Cleaned',
      value: stats.cleanedRooms,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-600',
    },
    {
      title: 'Pending',
      value: stats.pendingRooms,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-600',
    },
    {
      title: 'In Progress',
      value: stats.inProgressRooms,
      icon: <XCircle className="w-6 h-6" />,
      color: 'bg-orange-600',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
          Staff Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-400">View assigned tasks and room status</p>
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

      {assignedRooms.length > 0 && (
        <div className="mt-6">
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
            <h2 className="text-xl font-bold text-white mb-4">Assigned Rooms</h2>
            <div className="space-y-3">
              {assignedRooms.map((room: any) => (
                <div
                  key={room._id}
                  className="bg-[#0f172a] rounded-lg p-4 border border-[#334155] flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">Room {room.roomNumber}</p>
                    <p className="text-gray-400 text-sm">{room.roomTypeId?.name || 'Standard Room'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    room.status === 'cleaning' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-green-600/20 text-green-400'
                  }`}>
                    {room.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

