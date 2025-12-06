import connectDB from '@/lib/mongodb';
import RoomType from '@/lib/models/RoomType';
import RoomTypesList from '@/components/RoomTypesList';

export const dynamic = 'force-dynamic';

export default async function RoomTypesPage() {

  await connectDB();
  const roomTypes = await RoomType.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Room Types</h1>
          <p className="text-gray-400">Manage room types and their configurations</p>
        </div>
        <a
          href="/room-types/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Room Type
        </a>
      </div>

      <RoomTypesList roomTypes={roomTypes as any} />
    </div>
  );
}


