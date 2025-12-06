'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

export default function SettingsView() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [settings, setSettings] = useState({
    hotelName: '',
    taxRate: '10',
    currency: 'INR',
    address: '',
    phone: '',
    email: '',
    timezone: 'Asia/Kolkata',
    checkInTime: '14:00',
    checkOutTime: '11:00',
  });

  // Fetch settings from MongoDB Atlas
  const fetchSettings = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings({
            hotelName: data.settings.hotelName || '',
            taxRate: data.settings.taxRate?.toString() || '10',
            currency: data.settings.currency || 'INR',
            address: data.settings.address || '',
            phone: data.settings.phone || '',
            email: data.settings.email || '',
            timezone: data.settings.timezone || 'Asia/Kolkata',
            checkInTime: data.settings.checkInTime || '14:00',
            checkOutTime: data.settings.checkOutTime || '11:00',
          });
          console.log('✅ Settings loaded from MongoDB Atlas');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch settings:', errorData);
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();

    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(fetchSettings, 30000);
    
    // Refresh when page becomes visible
    const handleFocus = () => fetchSettings();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📤 Saving settings to MongoDB Atlas:', settings);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Settings saved successfully in MongoDB Atlas!');
        console.log('✅ Settings saved:', result);
        // Refresh settings to get latest data
        await fetchSettings();
      } else {
        toast.error(`❌ Error: ${result.error || 'Failed to save settings'}`);
        console.error('❌ Error response:', result);
      }
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      toast.error('Failed to save settings. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <div className="text-gray-400">Loading settings from MongoDB Atlas...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Hotel Settings</h2>
        <button
          onClick={fetchSettings}
          disabled={isFetching}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="hotelName" className="block text-sm font-medium text-gray-300 mb-2">
            Hotel Name
          </label>
          <input
            type="text"
            id="hotelName"
            value={settings.hotelName}
            onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
            className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-300 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              id="taxRate"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="SAR">SAR (﷼)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
            Address
          </label>
          <textarea
            id="address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="+91 1234567890"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="info@hotel.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <input
              type="text"
              id="timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Asia/Kolkata"
            />
          </div>

          <div>
            <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-300 mb-2">
              Check-in Time
            </label>
            <input
              type="time"
              id="checkInTime"
              value={settings.checkInTime}
              onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-300 mb-2">
              Check-out Time
            </label>
            <input
              type="time"
              id="checkOutTime"
              value={settings.checkOutTime}
              onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}



