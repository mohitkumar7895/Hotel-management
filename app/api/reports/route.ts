import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import Booking from '@/lib/models/Booking';
import Room from '@/lib/models/Room';
import ServiceBooking from '@/lib/models/ServiceBooking';
import Guest from '@/lib/models/Guest';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'financial';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month'; // today, week, month, year, custom

    // Calculate date range based on period
    let dateStart: Date;
    let dateEnd: Date = new Date();

    switch (period) {
      case 'today':
        dateStart = startOfDay(new Date());
        dateEnd = endOfDay(new Date());
        break;
      case 'week':
        dateStart = startOfDay(subDays(new Date(), 7));
        dateEnd = endOfDay(new Date());
        break;
      case 'month':
        dateStart = startOfMonth(new Date());
        dateEnd = endOfMonth(new Date());
        break;
      case 'year':
        dateStart = startOfYear(new Date());
        dateEnd = endOfYear(new Date());
        break;
      case 'custom':
        dateStart = startDate ? new Date(startDate) : startOfMonth(new Date());
        dateEnd = endDate ? new Date(endDate) : endOfMonth(new Date());
        dateEnd.setHours(23, 59, 59, 999);
        break;
      default:
        dateStart = startOfMonth(new Date());
        dateEnd = endOfMonth(new Date());
    }

    const response: any = {
      period,
      dateRange: {
        start: dateStart,
        end: dateEnd,
      },
    };

    // Financial Reports
    if (reportType === 'financial' || reportType === 'all') {
      // Revenue
      const revenue = await Transaction.aggregate([
        {
          $match: {
            type: 'revenue',
            date: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);

      // Revenue by category
      const revenueByCategory = await Transaction.aggregate([
        {
          $match: {
            type: 'revenue',
            date: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // Revenue by payment mode
      const revenueByPaymentMode = await Transaction.aggregate([
        {
          $match: {
            type: 'revenue',
            date: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: '$paymentMode',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // Daily revenue trend
      const dailyRevenue = await Transaction.aggregate([
        {
          $match: {
            type: 'revenue',
            date: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Expenses
      const expenses = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            date: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);

      // Expenses by category
      const expensesByCategory = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            date: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // Daily expense trend
      const dailyExpenses = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            date: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      response.financial = {
        revenue: {
          total: revenue[0]?.total || 0,
          count: revenue[0]?.count || 0,
          byCategory: revenueByCategory.map((item) => ({
            category: item._id,
            amount: item.total,
            count: item.count,
          })),
          byPaymentMode: revenueByPaymentMode.map((item) => ({
            mode: item._id,
            amount: item.total,
            count: item.count,
          })),
          daily: dailyRevenue.map((item) => ({
            date: item._id,
            amount: item.total,
            count: item.count,
          })),
        },
        expenses: {
          total: expenses[0]?.total || 0,
          count: expenses[0]?.count || 0,
          byCategory: expensesByCategory.map((item) => ({
            category: item._id,
            amount: item.total,
            count: item.count,
          })),
          daily: dailyExpenses.map((item) => ({
            date: item._id,
            amount: item.total,
            count: item.count,
          })),
        },
        profit: {
          total: (revenue[0]?.total || 0) - (expenses[0]?.total || 0),
        },
      };
    }

    // Occupancy Reports
    if (reportType === 'occupancy' || reportType === 'all') {
      const totalRooms = await Room.countDocuments();
      const availableRooms = await Room.countDocuments({ status: 'available' });
      const bookedRooms = await Room.countDocuments({ status: 'booked' });
      const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

      // Bookings in date range
      const bookingsInRange = await Booking.find({
        checkIn: { $lte: dateEnd },
        checkOut: { $gte: dateStart },
      }).countDocuments();

      // Check-ins in range
      const checkIns = await Booking.find({
        checkIn: { $gte: dateStart, $lte: dateEnd },
      }).countDocuments();

      // Check-outs in range
      const checkOuts = await Booking.find({
        checkOut: { $gte: dateStart, $lte: dateEnd },
      }).countDocuments();

      // Occupancy by room type
      const occupancyByRoomType = await Booking.aggregate([
        {
          $match: {
            checkIn: { $lte: dateEnd },
            checkOut: { $gte: dateStart },
          },
        },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room',
          },
        },
        { $unwind: '$room' },
        {
          $lookup: {
            from: 'roomtypes',
            localField: 'room.roomTypeId',
            foreignField: '_id',
            as: 'roomType',
          },
        },
        { $unwind: { path: '$roomType', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$roomType.name',
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { bookings: -1 } },
      ]);

      response.occupancy = {
        totalRooms,
        availableRooms,
        bookedRooms,
        maintenanceRooms,
        occupancyRate: totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0,
        bookingsInRange,
        checkIns,
        checkOuts,
        byRoomType: occupancyByRoomType.map((item) => ({
          roomType: item._id || 'Unknown',
          bookings: item.bookings,
          revenue: item.revenue || 0,
        })),
      };
    }

    // Booking Reports
    if (reportType === 'bookings' || reportType === 'all') {
      const bookings = await Booking.find({
        createdAt: { $gte: dateStart, $lte: dateEnd },
      })
        .populate('guestId', 'name phone email')
        .populate('roomId', 'roomNumber')
        .sort({ createdAt: -1 })
        .lean();

      // Booking statistics
      const bookingStats = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]);

      // Booking by payment status
      const bookingByPaymentStatus = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]);

      response.bookings = {
        total: bookings.length,
        list: bookings,
        byStatus: bookingStats.map((item) => ({
          status: item._id,
          count: item.count,
          revenue: item.totalRevenue || 0,
        })),
        byPaymentStatus: bookingByPaymentStatus.map((item) => ({
          status: item._id,
          count: item.count,
          revenue: item.totalRevenue || 0,
        })),
      };
    }

    // Service Reports
    if (reportType === 'services' || reportType === 'all') {
      const serviceBookings = await ServiceBooking.find({
        createdAt: { $gte: dateStart, $lte: dateEnd },
      })
        .populate('serviceId', 'name category price')
        .populate('guestId', 'name phone email')
        .sort({ createdAt: -1 })
        .lean();

      // Service statistics
      const serviceStats = await ServiceBooking.aggregate([
        {
          $match: {
            createdAt: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]);

      // Service by category
      const serviceByCategory = await ServiceBooking.aggregate([
        {
          $match: {
            createdAt: { $gte: dateStart, $lte: dateEnd },
          },
        },
        {
          $lookup: {
            from: 'extraservices',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: '$service' },
        {
          $group: {
            _id: '$service.category',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      response.services = {
        total: serviceBookings.length,
        totalRevenue: serviceBookings.reduce((sum, sb) => sum + (sb.totalAmount || 0), 0),
        list: serviceBookings,
        byStatus: serviceStats.map((item) => ({
          status: item._id,
          count: item.count,
          revenue: item.totalRevenue || 0,
        })),
        byCategory: serviceByCategory.map((item) => ({
          category: item._id,
          count: item.count,
          revenue: item.totalRevenue || 0,
        })),
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate reports' },
      { status: 500 }
    );
  }
}

