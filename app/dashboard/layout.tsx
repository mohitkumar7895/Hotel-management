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
  User,
  Edit,
  ChevronDown,
  Building2,
  Calendar,
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  hasSubmenu?: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard' },
  { name: 'My Bookings', icon: <Calendar className="w-5 h-5" />, href: '/my-bookings' },
  { name: 'Guests', icon: <Users className="w-5 h-5" />, href: '/guests' },
  { name: 'Room Type', icon: <Bed className="w-5 h-5" />, href: '/room-types' },
  { name: 'Rooms', icon: <DoorOpen className="w-5 h-5" />, href: '/rooms' },
  { name: 'Accounts', icon: <Wallet className="w-5 h-5" />, href: '/accounts', hasSubmenu: true },
  { name: 'Extra Services', icon: <Coffee className="w-5 h-5" />, href: '/extra-services' },
  { name: 'Clients', icon: <Building2 className="w-5 h-5" />, href: '/clients' },
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
  // Start with null to avoid hydration mismatch - server and client must match
  const [user, setUser] = useState<{ name: string; email: string; _id?: string; profileImage?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hotelName, setHotelName] = useState<string>('Hotel Name');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration errors
    setMounted(true);
    
    // Try to load from localStorage first for instant display
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
        } catch (e) {
          // Invalid data, ignore
        }
      }
    }

    // Fetch current user
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Store in localStorage for fast access
          if (data.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
          }
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

    // Fetch hotel name from settings
    const fetchHotelName = async () => {
      try {
        const response = await fetch('/api/settings', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.settings?.hotelName) {
            setHotelName(data.settings.hotelName);
          }
        }
      } catch (error) {
        console.error('Error fetching hotel name:', error);
      }
    };

    fetchHotelName();
    
    // Refresh user data when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };
    
    // Listen for profile image updates
    const handleProfileUpdate = () => {
      console.log('Profile update detected, refreshing user data');
      fetchUser();
    };
    
    // Listen for storage events (when profile is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileImageUpdated') {
        fetchUser();
        localStorage.removeItem('profileImageUpdated');
      }
    };
    
    // Listen for custom event
    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    // Only poll if user is not loaded initially (max 3 attempts, then stop)
    let pollAttempts = 0;
    const maxPollAttempts = 3;
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (!user) {
      pollInterval = setInterval(() => {
        if (pollAttempts >= maxPollAttempts) {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
          return;
        }
        if (document.visibilityState === 'visible') {
          pollAttempts++;
          fetchUser();
        }
      }, 10000);
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('profileImageUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.notification-menu')) {
        setUserMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1e293b] border-r border-[#334155] transition-all duration-300 flex flex-col ${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden md:flex'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-3 sm:px-4 border-b border-[#334155]">
          {sidebarOpen && (
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Hotel System</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 sm:py-4">
          <ul className="space-y-1 px-1 sm:px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                      isActive
                        ? 'bg-[#3b82f6] text-white'
                        : 'text-gray-300 hover:bg-[#334155] hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.hasSubmenu && (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
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
        <header className="h-16 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white p-1"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate max-w-[120px] sm:max-w-[180px] md:max-w-none" title={hotelName}>
              {hotelName}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Notifications */}
            <div className="relative notification-menu">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
                className="text-gray-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-[#1e293b] border border-[#334155] rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-[#334155]">
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No new notifications
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Language/Globe */}
            <button
              className="text-gray-400 hover:text-white transition-colors"
              title="Language Settings"
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 sm:gap-3 hover:bg-[#334155] px-2 sm:px-3 py-2 rounded-lg transition-colors cursor-pointer"
                title="User Menu"
              >
                {user?.profileImage ? (
                  <img
                    src={`${user.profileImage}?t=${Date.now()}`}
                    alt={user.name || 'User'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    key={`header-${user.profileImage}-${Date.now()}`}
                    onError={(e) => {
                      console.error('Header image failed to load:', user.profileImage);
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    {mounted && user ? (user.name && user.name.trim() ? user.name.trim()[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')) : 'U'}
                  </div>
                )}
                <span className="text-white font-medium hidden sm:block text-sm sm:text-base">
                  {mounted && user ? (user.name && user.name.trim() ? user.name.trim() : (user.email ? user.email.split('@')[0] : 'User')) : 'User'}
                </span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-[#334155] bg-[#0f172a]">
                    <div className="flex items-center gap-3">
                      {user?.profileImage ? (
                        <img
                          src={`${user.profileImage}?t=${Date.now()}`}
                          alt={user.name || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                          key={`dropdown-${user.profileImage}-${Date.now()}`}
                          onError={(e) => {
                            console.error('Dropdown image failed to load:', user.profileImage);
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                          {mounted && user ? (user.name && user.name.trim() ? user.name.trim()[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')) : 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{mounted && user ? (user.name && user.name.trim() ? user.name.trim() : (user.email ? user.email.split('@')[0] : 'User')) : 'User'}</p>
                        <p className="text-gray-400 text-sm truncate">{user?.email || ''}</p>
                      </div>
                    </div>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#334155] hover:text-white transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span>View Profile</span>
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#334155] hover:text-white transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                        <span>Edit Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#334155] hover:text-white transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-[#334155] my-2"></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">{children}</main>

        <footer className="h-12 bg-[#1e293b] border-t border-[#334155] flex items-center justify-between px-3 sm:px-4 md:px-6 text-xs sm:text-sm text-gray-400">
          <span className="truncate mr-2">Hotel system Powered By: SecLance</span>
          <span className="flex-shrink-0">Version 1.0</span>
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
