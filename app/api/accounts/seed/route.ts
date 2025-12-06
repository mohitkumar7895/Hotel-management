import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import Invoice from '@/lib/models/Invoice';
import Payment from '@/lib/models/Payment';
import Vendor from '@/lib/models/Vendor';
import Booking from '@/lib/models/Booking';
import Guest from '@/lib/models/Guest';
import Room from '@/lib/models/Room';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing data
    await Transaction.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await Vendor.deleteMany({});

    // Get or create a user for transactions
    let user = await User.findOne({ role: 'admin' });
    if (!user) {
      user = await User.findOne();
    }
    if (!user) {
      return NextResponse.json(
        { error: 'No user found. Please create a user first.' },
        { status: 400 }
      );
    }

    const userId = user._id;

    // Create Vendors
    const vendors = await Vendor.insertMany([
      {
        name: 'ABC Supplies Ltd',
        contactPerson: 'John Doe',
        email: 'john@abcsupplies.com',
        phone: '+91 9876543210',
        address: '123 Business Street, Mumbai, Maharashtra',
        gstNumber: '27ABCDE1234F1Z5',
        outstandingBalance: 50000,
        totalPaid: 200000,
        totalTransactions: 15,
      },
      {
        name: 'XYZ Maintenance Services',
        contactPerson: 'Jane Smith',
        email: 'jane@xyzmaintenance.com',
        phone: '+91 9876543211',
        address: '456 Service Road, Delhi, NCR',
        gstNumber: '07XYZAB5678G2H6',
        outstandingBalance: 25000,
        totalPaid: 150000,
        totalTransactions: 10,
      },
      {
        name: 'Fresh Food Distributors',
        contactPerson: 'Raj Kumar',
        email: 'raj@freshfood.com',
        phone: '+91 9876543212',
        address: '789 Market Lane, Bangalore, Karnataka',
        gstNumber: '29FRESH9012I3J7',
        outstandingBalance: 0,
        totalPaid: 300000,
        totalTransactions: 25,
      },
      {
        name: 'CleanTech Solutions',
        contactPerson: 'Priya Sharma',
        email: 'priya@cleantech.com',
        phone: '+91 9876543213',
        address: '321 Clean Street, Pune, Maharashtra',
        gstNumber: '27CLEAN3456K4L8',
        outstandingBalance: 15000,
        totalPaid: 100000,
        totalTransactions: 8,
      },
    ]);

    // Get bookings for revenue transactions
    const bookings = await Booking.find().limit(20).lean();
    const guests = await Guest.find().limit(20).lean();
    const rooms = await Room.find().limit(20).lean();

    // Create Revenue Transactions
    const revenueCategories = ['Room Booking', 'Restaurant', 'Spa', 'Laundry', 'Banquet', 'Taxes'];
    const paymentModes = ['cash', 'card', 'upi', 'netbanking'];
    const revenueTransactions = [];

    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
      const category = revenueCategories[Math.floor(Math.random() * revenueCategories.length)];
      const amount = Math.floor(Math.random() * 50000) + 1000; // 1000 to 50000
      const booking = bookings[Math.floor(Math.random() * bookings.length)];

      revenueTransactions.push({
        type: 'revenue',
        category,
        amount,
        date,
        reference: booking ? `BK-${booking._id.toString().slice(-6)}` : `REF-${i + 1}`,
        paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
        description: `${category} revenue entry`,
        bookingId: booking ? booking._id : undefined,
        createdBy: userId,
      });
    }

    await Transaction.insertMany(revenueTransactions);

    // Create Expense Transactions
    const expenseCategories = ['Salaries', 'Inventory', 'Utilities', 'Maintenance', 'Vendor Payments', 'Marketing'];
    const expenseTransactions = [];

    for (let i = 0; i < 40; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const amount = Math.floor(Math.random() * 30000) + 500; // 500 to 30000
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];

      expenseTransactions.push({
        type: 'expense',
        category,
        amount,
        date,
        reference: `EXP-${i + 1}`,
        paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
        description: `${category} expense entry`,
        vendorId: category === 'Vendor Payments' ? vendor._id : undefined,
        createdBy: userId,
      });
    }

    await Transaction.insertMany(expenseTransactions);

    // Create Invoices
    const invoices = [];
    for (let i = 0; i < 15; i++) {
      const booking = bookings[Math.floor(Math.random() * bookings.length)];
      const guest = guests[Math.floor(Math.random() * guests.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];

      if (!booking || !guest || !room) continue;

      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const roomRate = booking.totalAmount / days;

      const items = [
        {
          description: `Room Charges (${days} nights)`,
          quantity: days,
          rate: roomRate,
          amount: booking.totalAmount,
        },
      ];

      // Add random services
      if (Math.random() > 0.5) {
        items.push({
          description: 'Restaurant Services',
          quantity: Math.floor(Math.random() * 5) + 1,
          rate: 500,
          amount: (Math.floor(Math.random() * 5) + 1) * 500,
        });
      }

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.18; // 18% GST
      const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0; // 10% discount sometimes
      const totalAmount = subtotal + tax - discount;
      const paidAmount = Math.random() > 0.3 ? totalAmount * (0.5 + Math.random() * 0.5) : 0;
      const dueAmount = totalAmount - paidAmount;

      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;

      invoices.push({
        invoiceNumber,
        bookingId: booking._id,
        guestId: guest._id,
        roomId: room._id,
        checkIn,
        checkOut,
        items,
        subtotal,
        tax,
        discount,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentStatus: paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
        paymentMode: paidAmount > 0 ? paymentModes[Math.floor(Math.random() * paymentModes.length)] : undefined,
        issuedBy: userId,
      });
    }

    const createdInvoices = await Invoice.insertMany(invoices);

    // Create Payments for invoices
    const payments = [];
    for (const invoice of createdInvoices) {
      if (invoice.paidAmount > 0) {
        // Full payment
        if (invoice.paymentStatus === 'paid') {
          payments.push({
            invoiceId: invoice._id,
            amount: invoice.paidAmount,
            paymentMode: invoice.paymentMode || 'cash',
            paymentDate: new Date(invoice.createdAt),
            reference: `PAY-${invoice.invoiceNumber}`,
            receivedBy: userId,
          });
        } else {
          // Partial payment
          payments.push({
            invoiceId: invoice._id,
            amount: invoice.paidAmount,
            paymentMode: invoice.paymentMode || 'cash',
            paymentDate: new Date(invoice.createdAt),
            reference: `PAY-${invoice.invoiceNumber}`,
            receivedBy: userId,
          });
        }
      }
    }

    if (payments.length > 0) {
      await Payment.insertMany(payments);
    }

    return NextResponse.json({
      message: 'Seed data created successfully',
      counts: {
        vendors: vendors.length,
        revenueTransactions: revenueTransactions.length,
        expenseTransactions: expenseTransactions.length,
        invoices: invoices.length,
        payments: payments.length,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed data' },
      { status: 500 }
    );
  }
}

