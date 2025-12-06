export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  phone?: string;
}

export interface RoomType {
  _id: string;
  name: string;
  description: string;
  price: number;
  amenities: string[];
  maxGuests: number;
  image?: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  roomTypeId: string;
  floor: number;
  status: 'available' | 'booked' | 'cleaning' | 'maintenance';
  roomType?: RoomType;
}

export interface Guest {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  idProof: string;
  checkIn?: Date;
  checkOut?: Date;
  roomId?: string;
}

export interface Booking {
  _id: string;
  guestId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  guest?: Guest;
  room?: Room;
}

export interface ExtraService {
  _id: string;
  name: string;
  price: number;
  icon?: string;
  description?: string;
}

export interface ServiceRequest {
  _id: string;
  roomId: string;
  serviceId: string;
  notes?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  room?: Room;
  service?: ExtraService;
}

export interface Account {
  _id: string;
  bookingId?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
}



