import { Bed, Users, Calendar, DollarSign } from 'lucide-react';

interface DashboardStatsProps {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  cleaningRooms: number;
  todaysCheckIns: number;
  todaysCheckOuts: number;
  monthlyRevenue: number;
}

export default function DashboardStats({
  totalRooms,
  occupiedRooms,
  availableRooms,
  cleaningRooms,
  todaysCheckIns,
  todaysCheckOuts,
  monthlyRevenue,
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Rooms',
      value: totalRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      title: 'Occupied',
      value: occupiedRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-red-600',
    },
    {
      title: 'Available',
      value: availableRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-green-600',
    },
    {
      title: 'Cleaning',
      value: cleaningRooms,
      icon: <Bed className="w-6 h-6" />,
      color: 'bg-yellow-600',
    },
    {
      title: "Today's Check-ins",
      value: todaysCheckIns,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-purple-600',
    },
    {
      title: "Today's Check-outs",
      value: todaysCheckOuts,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-600',
    },
    {
      title: 'Revenue This Month',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
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
  );
}


