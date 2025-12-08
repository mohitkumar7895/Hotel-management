'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Booking {
  _id: string;
  guestId: any;
  roomId: any;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);
  const [formData, setFormData] = useState({
    tax: 0,
    discount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const result = await response.json();
        setBookings(result.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleBookingSelect = (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      // Auto-populate room charge
      const days = Math.ceil(
        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      setItems([
        {
          description: `Room Charges (${days} nights)`,
          quantity: days,
          rate: booking.totalAmount / days,
          amount: booking.totalAmount,
        },
      ]);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = formData.tax || 0;
    const discount = formData.discount || 0;
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) {
      alert('Please select a booking');
      return;
    }

    if (items.some((item) => !item.description || item.amount <= 0)) {
      alert('Please fill all item details correctly');
      return;
    }

    setLoading(true);

    try {
      const { subtotal, tax, discount, total } = calculateTotals();
      const response = await fetch('/api/accounts/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
          tax,
          discount,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/accounts/invoices/${result.invoice._id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, discount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts/invoices"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Generate Invoice</h1>
          <p className="text-gray-400">Create invoice from booking</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Booking <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={selectedBooking?._id || ''}
              onChange={(e) => handleBookingSelect(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a booking</option>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {booking.guestId?.name || 'Guest'} - Room {booking.roomId?.roomNumber || 'N/A'} - {formatCurrency(booking.totalAmount)}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-400">Invoice Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                      placeholder="Rate"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.amount}
                      readOnly
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                      placeholder="Amount"
                    />
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#334155]">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tax (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Discount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <p className="text-sm text-gray-400 mb-2">Subtotal: {formatCurrency(subtotal)}</p>
                <p className="text-lg font-bold text-white">Total: {formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#334155]">
            <Link
              href="/accounts/invoices"
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


