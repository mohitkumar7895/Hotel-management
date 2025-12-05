import connectDB from '@/lib/mongodb';
import Room from '@/lib/models/Room';
import RoomType from '@/lib/models/RoomType';
import RoomsList from '@/components/RoomsList';

export default async function RoomsPage() {

  await connectDB();
  const rooms = await Room.find()
    .populate('roomTypeId', 'name price')
    .sort({ roomNumber: 1 })
    .lean();

  const roomTypes = await RoomType.find().lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Rooms</h1>
          <p className="text-gray-400">Manage all rooms and their status</p>
        </div>
        <a
          href="/rooms/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Room
        </a>
      </div>

      <RoomsList rooms={rooms as any} roomTypes={roomTypes as any} />
    </div>
  );
}


