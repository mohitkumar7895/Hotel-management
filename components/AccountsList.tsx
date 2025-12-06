'use client';

import { format } from 'date-fns';

interface Account {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
}

export default function AccountsList({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
        <p className="text-gray-400">No account entries found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Description</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account._id} className="border-b border-[#334155] hover:bg-[#0f172a]">
                <td className="py-3 px-4 text-gray-300">
                  {format(new Date(account.date), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      account.type === 'income'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {account.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300">{account.category}</td>
                <td className="py-3 px-4 text-gray-300">{account.description}</td>
                <td
                  className={`py-3 px-4 font-medium ${
                    account.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {account.type === 'income' ? '+' : '-'}${account.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



