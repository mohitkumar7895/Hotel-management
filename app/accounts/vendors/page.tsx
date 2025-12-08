'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';

interface Vendor {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  gstNumber?: string;
  outstandingBalance: number;
  totalPaid: number;
  totalTransactions: number;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/accounts/vendors');
      if (response.ok) {
        const result = await response.json();
        setVendors(result.vendors || []);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`/api/accounts/vendors/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchVendors();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete vendor');
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Vendor Management</h1>
          <p className="text-gray-400">Manage vendor information and payments</p>
        </div>
        <Link
          href="/accounts/vendors/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </Link>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
          <p className="text-gray-400">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-[#1e293b] rounded-lg border border-[#334155] p-6 hover:border-[#475569] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{vendor.name}</h3>
                  {vendor.contactPerson && (
                    <p className="text-sm text-gray-400">Contact: {vendor.contactPerson}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/accounts/vendors/${vendor._id}/edit`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(vendor._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {vendor.email && (
                  <p className="text-gray-300">
                    <span className="text-gray-400">Email:</span> {vendor.email}
                  </p>
                )}
                <p className="text-gray-300">
                  <span className="text-gray-400">Phone:</span> {vendor.phone}
                </p>
                {vendor.address && (
                  <p className="text-gray-300">
                    <span className="text-gray-400">Address:</span> {vendor.address}
                  </p>
                )}
                {vendor.gstNumber && (
                  <p className="text-gray-300">
                    <span className="text-gray-400">GST:</span> {vendor.gstNumber}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#334155] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Outstanding Balance</span>
                  <span className="text-red-400 font-semibold">
                    {formatCurrency(vendor.outstandingBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Paid</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(vendor.totalPaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Transactions</span>
                  <span className="text-white font-semibold">{vendor.totalTransactions}</span>
                </div>
              </div>

              {vendor.outstandingBalance > 0 && (
                <Link
                  href={`/accounts/vendors/${vendor._id}/pay`}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Record Payment
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


