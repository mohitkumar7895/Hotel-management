import connectDB from '@/lib/mongodb';
import Account from '@/lib/models/Account';
import AccountsList from '@/components/AccountsList';

export default async function AccountsPage() {

  await connectDB();
  const accounts = await Account.find()
    .populate('bookingId', 'guestId roomId')
    .sort({ date: -1 })
    .limit(100)
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Accounts</h1>
          <p className="text-gray-400">View income and expense records</p>
        </div>
        <a
          href="/accounts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Entry
        </a>
      </div>

      <AccountsList accounts={accounts as any} />
    </div>
  );
}


