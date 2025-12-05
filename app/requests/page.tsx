import connectDB from '@/lib/mongodb';
import ServiceRequest from '@/lib/models/ServiceRequest';
import RequestsList from '@/components/RequestsList';

export default async function RequestsPage() {

  await connectDB();
  const requests = await ServiceRequest.find()
    .populate('roomId', 'roomNumber')
    .populate('serviceId', 'name price')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Service Requests</h1>
        <p className="text-gray-400">Manage guest service requests</p>
      </div>

      <RequestsList requests={requests as any} />
    </div>
  );
}


