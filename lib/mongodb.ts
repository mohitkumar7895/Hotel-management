import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL!;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    // Verify connection is to MongoDB Atlas, not localhost
    const dbName = cached.conn.connection.db?.databaseName;
    const host = cached.conn.connection.host;
    console.log(`✅ Already connected to MongoDB: ${host} | Database: ${dbName}`);
    
    // Check if it's localhost (not allowed)
    if (host === 'localhost' || host === '127.0.0.1') {
      console.error('❌ ERROR: Connected to localhost! Please use MongoDB Atlas connection string.');
      throw new Error('Cannot use localhost MongoDB. Please configure DATABASE_URL with MongoDB Atlas connection string.');
    }
    
    return cached.conn;
  }

  if (!cached.promise) {
    // Verify connection string is MongoDB Atlas (not localhost)
    if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
      console.error('❌ ERROR: DATABASE_URL contains localhost!');
      throw new Error('DATABASE_URL must be a MongoDB Atlas connection string, not localhost. Please update .env.local file.');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log(`📍 Connection string: ${MONGODB_URI.substring(0, 30)}...`);

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      const dbName = mongoose.connection.db?.databaseName;
      const host = mongoose.connection.host;
      console.log(`✅ Connected to MongoDB Atlas: ${host} | Database: ${dbName}`);
      
      // Double check it's not localhost
      if (host === 'localhost' || host === '127.0.0.1') {
        console.error('❌ ERROR: Connected to localhost despite connection string check!');
        throw new Error('Connected to localhost instead of MongoDB Atlas. Please check your DATABASE_URL.');
      }
      
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Final verification
    const dbName = cached.conn.connection.db?.databaseName;
    const host = cached.conn.connection.host;
    console.log(`✅ MongoDB Atlas connection verified: ${host} | Database: ${dbName}`);
    
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;



