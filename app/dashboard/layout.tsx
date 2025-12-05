'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Bed,
  DoorOpen,
  Wallet,
  Coffee,
  FileText,
  MessageSquare,
  UserCog,
  Settings,
  ChevronRight,
  Bell,
  Globe,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  hasSubmenu?: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard' },
  { name: 'Guests', icon: <Users className="w-5 h-5" />, href: '/guests' },
  { name: 'Room Type', icon: <Bed className="w-5 h-5" />, href: '/room-types' },
  { name: 'Rooms', icon: <DoorOpen className="w-5 h-5" />, href: '/rooms' },
  { name: 'Accounts', icon: <Wallet className="w-5 h-5" />, href: '/accounts', hasSubmenu: true },
  { name: 'Extra Services', icon: <Coffee className="w-5 h-5" />, href: '/extra-services' },
  { name: 'Reports', icon: <FileText className="w-5 h-5" />, href: '/reports', hasSubmenu: true },
  { name: 'Requests', icon: <MessageSquare className="w-5 h-5" />, href: '/requests' },
  { name: 'Users', icon: <UserCog className="w-5 h-5" />, href: '/users' },
  { name: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings', hasSubmenu: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Don't redirect from layout, let the page handle it
          // router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Don't redirect from layout, let the page handle it
        // router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1e293b] border-r border-[#334155] transition-all duration-300 flex flex-col ${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden md:flex'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#334155]">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-white">Hotel System</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#3b82f6] text-white'
                        : 'text-gray-300 hover:bg-[#334155] hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.hasSubmenu && (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-white">Hotel Name</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.[0] || 'S'}
              </div>
              <span className="text-white font-medium hidden sm:block">
                {user?.name || 'Shikha'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        <footer className="h-12 bg-[#1e293b] border-t border-[#334155] flex items-center justify-between px-6 text-sm text-gray-400">
          <span>Hotel system Powered By: SecLance</span>
          <span>Version 1.0</span>
        </footer>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
