'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteUser } from '@/app/actions/users';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export default function UsersList({ users }: { users: User[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    setDeleting(id);
    try {
      const result = await deleteUser(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('User deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                <td className="py-3 px-4 text-white font-medium">{user.name}</td>
                <td className="py-3 px-4 text-gray-300">{user.email}</td>
                <td className="py-3 px-4 text-gray-300">{user.phone || '-'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={deleting === user._id}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


