import connectDB from '@/lib/mongodb';
import ExtraService from '@/lib/models/ExtraService';
import ExtraServicesList from '@/components/ExtraServicesList';

export default async function ExtraServicesPage() {

  await connectDB();
  const services = await ExtraService.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Extra Services</h1>
          <p className="text-gray-400">Manage additional services offered to guests</p>
        </div>
        <a
          href="/extra-services/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Service
        </a>
      </div>

      <ExtraServicesList services={services as any} />
    </div>
  );
}


