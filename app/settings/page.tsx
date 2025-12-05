import SettingsView from '@/components/SettingsView';

export default async function SettingsPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage hotel settings and preferences</p>
      </div>

      <SettingsView />
    </div>
  );
}


