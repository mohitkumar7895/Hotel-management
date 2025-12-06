'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Download, CreditCard } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Payment {
  _id: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  reference?: string;
  receivedBy?: any;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  guestId: any;
  roomId: any;
  bookingId: any;
  checkIn: string;
  checkOut: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  paymentMode?: string;
  notes?: string;
  createdAt: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'cash',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/accounts/invoices/${id}`);
      if (response.ok) {
        const result = await response.json();
        setInvoice(result.invoice);
        setPayments(result.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (parseFloat(paymentForm.amount) > invoice.dueAmount) {
      alert('Payment amount cannot exceed due amount');
      return;
    }

    try {
      const response = await fetch(`/api/accounts/invoices/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount),
        }),
      });

      if (response.ok) {
        setShowPaymentForm(false);
        setPaymentForm({ amount: '', paymentMode: 'cash', reference: '', notes: '' });
        fetchInvoice();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/accounts/invoices/${id}/pdf`);
      if (response.ok) {
        // In a real app, generate PDF here
        alert('PDF generation would be implemented here');
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/accounts/invoices"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Invoice #{invoice.invoiceNumber}</h1>
            <p className="text-gray-400">Invoice details and payment management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          {invoice.dueAmount > 0 && (
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Add Payment
            </button>
          )}
        </div>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Record Payment</h2>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={invoice.dueAmount}
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                  placeholder={`Max: ${formatCurrency(invoice.dueAmount)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Payment Mode <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Reference</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                  placeholder="Transaction reference"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={2}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Details */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Guest Information</h3>
            <div className="space-y-2 text-gray-300">
              <p><span className="text-gray-400">Name:</span> {invoice.guestId?.name || 'N/A'}</p>
              <p><span className="text-gray-400">Email:</span> {invoice.guestId?.email || 'N/A'}</p>
              <p><span className="text-gray-400">Phone:</span> {invoice.guestId?.phone || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Booking Details</h3>
            <div className="space-y-2 text-gray-300">
              <p><span className="text-gray-400">Room:</span> {invoice.roomId?.roomNumber || 'N/A'}</p>
              <p><span className="text-gray-400">Check-In:</span> {format(new Date(invoice.checkIn), 'MMM dd, yyyy')}</p>
              <p><span className="text-gray-400">Check-Out:</span> {format(new Date(invoice.checkOut), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Invoice Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Description</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-400">Quantity</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-400">Rate</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-[#334155]">
                    <td className="py-2 px-4 text-gray-300">{item.description}</td>
                    <td className="py-2 px-4 text-gray-300 text-right">{item.quantity}</td>
                    <td className="py-2 px-4 text-gray-300 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-2 px-4 text-white text-right font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-[#334155] pt-4">
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Tax:</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Discount:</span>
                  <span className="text-red-400">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-[#334155]">
                <span>Total:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-green-400 pt-2">
                <span>Paid:</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Due:</span>
                <span>{formatCurrency(invoice.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 pt-6 border-t border-[#334155]">
            <p className="text-gray-400 text-sm"><span className="font-medium">Notes:</span> {invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Payment Mode</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Reference</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Received By</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-[#334155]">
                    <td className="py-2 px-4 text-gray-300">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-2 px-4 text-green-400 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-2 px-4 text-gray-300 capitalize">
                      {payment.paymentMode}
                    </td>
                    <td className="py-2 px-4 text-gray-300">
                      {payment.reference || '-'}
                    </td>
                    <td className="py-2 px-4 text-gray-300">
                      {payment.receivedBy?.name || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

