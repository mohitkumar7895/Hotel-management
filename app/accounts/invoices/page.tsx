'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Plus, FileText, Download, Eye } from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  guestId: any;
  roomId: any;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/accounts/invoices');
      if (response.ok) {
        const result = await response.json();
        setInvoices(result.invoices || []);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/accounts/invoices/${invoiceId}/pdf`);
      if (response.ok) {
        const result = await response.json();
        // In a real app, you would generate PDF here or redirect to PDF view
        alert('PDF generation would be implemented here. Invoice data loaded.');
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download invoice PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Invoice Management</h1>
          <p className="text-gray-400">Generate and manage invoices</p>
        </div>
        <Link
          href="/accounts/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </Link>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Invoice #</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Guest</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Room</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Total Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Paid</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Due</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-b border-[#334155] hover:bg-[#0f172a] transition-colors"
                  >
                    <td className="py-3 px-6 text-gray-300 font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-3 px-6 text-gray-300">
                      {invoice.guestId?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-6 text-gray-300">
                      {invoice.roomId?.roomNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-6 text-white font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="py-3 px-6 text-green-400">
                      {formatCurrency(invoice.paidAmount)}
                    </td>
                    <td className="py-3 px-6 text-red-400">
                      {formatCurrency(invoice.dueAmount)}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.paymentStatus === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : invoice.paymentStatus === 'partial'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-300">
                      {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/accounts/invoices/${invoice._id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(invoice._id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


