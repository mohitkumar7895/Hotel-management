import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';
import GuestsList from '@/components/GuestsList';

export const dynamic = 'force-dynamic';

export default async function GuestsPage() {

  await connectDB();
  const guests = await Guest.find()
    .populate('roomId', 'roomNumber')
    .select('name phone email address idProof checkIn checkOut roomId roomTypeId createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Guests</h1>
          <p className="text-gray-400">Manage guest information and check-ins</p>
        </div>
        <a
          href="/guests/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Guest
        </a>
      </div>

      <GuestsList guests={guests as any} />
    </div>
  );
}


