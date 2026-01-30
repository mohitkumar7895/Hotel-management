import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import UsersList from '@/components/UsersList';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  // Check if user is superadmin
  const cookieStore = await cookies();
  const token = cookieStore.get('hotel-token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect('/login');
  }

  await connectDB();
  const currentUser = await User.findById(payload.userId).lean();

  if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.email !== 'superadmin@gmail.com')) {
    // Redirect non-superadmin to their role-specific dashboard
    if (currentUser?.role === 'admin') {
      redirect('/dashboard/admin');
    } else if (currentUser?.role === 'manager') {
      redirect('/dashboard/manager');
    } else if (currentUser?.role === 'accountant') {
      redirect('/dashboard/accountant');
    } else if (currentUser?.role === 'staff') {
      redirect('/dashboard/staff');
    } else if (currentUser?.role === 'USER') {
      redirect('/my-bookings');
    } else {
      redirect('/dashboard');
    }
  }

  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Users Management</h1>
          <p className="text-gray-400">Manage admin, staff, accountant, and manager users</p>
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


