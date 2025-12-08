# Hotel Management System

A complete, professional Hotel Management System built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, and MongoDB Atlas.

## Features

- 🔐 **Authentication System** - Secure JWT-based authentication with httpOnly cookies
- 🏨 **Room Management** - Full CRUD operations for room types and rooms
- 👥 **Guest Management** - Complete guest information management with check-in/check-out flow
- 📅 **Booking System** - Manage reservations and bookings
- 💰 **Financial Management** - Track income, expenses, and revenue
- 📊 **Dashboard** - Real-time statistics, charts, and recent bookings
- 🛎️ **Extra Services** - Manage additional services offered to guests
- 📋 **Service Requests** - Handle guest service requests
- 📈 **Reports** - Revenue and occupancy reports with CSV export
- 👤 **User Management** - Admin can create and manage staff users
- ⚙️ **Settings** - Configure hotel information and preferences

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas (Mongoose)
- **Authentication**: JWT with httpOnly cookies
- **Validation**: Zod
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

## Installation

1. **Clone the repository** (or navigate to the project directory)

```bash
cd "Hotel management"
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="mongodb+srv://hotelansh:hotelansh@cluster0.i6pm9hl.mongodb.net/hotels?retryWrites=true&w=majority"
JWT_SECRET="your_strong_secret_here_change_in_production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here_change_in_production"
```

**Important**: Change the `JWT_SECRET` and `NEXTAUTH_SECRET` to strong, random strings in production.

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## First Time Setup

1. **Register an account** - The first user registered will automatically be assigned the `admin` role
2. **Login** - Use your credentials to access the dashboard
3. **Create Room Types** - Go to Room Types and add your room categories
4. **Create Rooms** - Add rooms to your system
5. **Start managing** - You're ready to manage your hotel!

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── actions/            # Server actions
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── guests/            # Guest management
│   ├── room-types/        # Room type management
│   ├── rooms/             # Room management
│   ├── bookings/          # Booking management
│   ├── extra-services/    # Extra services
│   ├── requests/          # Service requests
│   ├── reports/           # Reports page
│   ├── users/             # User management (admin only)
│   ├── settings/          # Settings page
│   ├── accounts/          # Accounts/financial records
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
├── lib/                   # Utility functions and models
│   ├── models/           # Mongoose models
│   ├── auth.ts           # Authentication utilities
│   ├── mongodb.ts        # Database connection
│   └── types.ts          # TypeScript types
├── middleware.ts          # Next.js middleware for route protection
└── public/               # Static assets
```

## Database Models

- **User** - Admin and staff users
- **RoomType** - Room categories with pricing and amenities
- **Room** - Individual rooms with status tracking
- **Guest** - Guest information and check-in/check-out dates
- **Booking** - Reservations and booking records
- **ExtraService** - Additional services offered
- **ServiceRequest** - Guest service requests
- **Account** - Income and expense records

## Key Features Explained

### Authentication
- Secure password hashing with bcrypt
- JWT tokens stored in httpOnly cookies
- Protected routes with middleware
- Role-based access control (admin/staff)

### Dashboard
- Real-time statistics (rooms, occupancy, revenue)
- Today's check-ins and check-outs
- Monthly revenue tracking
- Recent bookings table
- Revenue charts (last 7 days)

### Room Management
- Create and manage room types with images
- Add rooms with status tracking
- Bulk status updates
- Room availability tracking

### Guest Management
- Complete guest profiles
- Check-in/check-out flow
- Room assignment
- Guest history tracking

### Booking System
- Create and manage bookings
- Check-in/check-out status
- Payment status tracking
- Booking calendar view

### Reports
- Monthly revenue reports
- Occupancy rate calculations
- CSV export functionality
- Booking history

## Security Features

- Environment variables for sensitive data
- Input validation with Zod
- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Protected API routes
- SQL injection prevention (Mongoose)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Production Deployment

1. **Update environment variables** - Use strong secrets in production
2. **Build the application** - `npm run build`
3. **Deploy** - Deploy to Vercel, Netlify, or your preferred hosting platform
4. **Configure MongoDB Atlas** - Ensure your database is accessible from your production domain
5. **Set up environment variables** - Add all required env vars in your hosting platform

## Troubleshooting

### Database Connection Issues
- Verify your MongoDB Atlas connection string
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure the database name matches in the connection string

### Authentication Issues
- Clear browser cookies
- Verify JWT_SECRET is set correctly
- Check middleware configuration

### Build Errors
- Ensure all dependencies are installed
- Check TypeScript errors
- Verify all environment variables are set

## Contributing

This is a complete hotel management system. Feel free to extend it with additional features:

- Email notifications
- SMS integration
- Payment gateway integration
- Advanced reporting
- Mobile app
- Multi-language support
- Print invoice functionality

## License

This project is open source and available for use.

## Support

For issues or questions, please check the codebase or create an issue in the repository.

---

**Version**: 1.0  
**Powered By**: SecLance




