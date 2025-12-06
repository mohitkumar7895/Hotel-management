import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import UsersList from '@/components/UsersList';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {

  await connectDB();
  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Users</h1>
          <p className="text-gray-400">Manage staff and admin users</p>
        </div>
        <a
          href="/users/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add User
        </a>
      </div>

      <UsersList users={users as any} />
    </div>
  );
}


