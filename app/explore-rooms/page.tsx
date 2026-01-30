'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bed, Search, Filter, Star, Users, Wifi, Car, UtensilsCrossed, 
  Waves, Tv, Wind, Coffee, ArrowLeft, ArrowRight, CheckCircle,
  MapPin, Calendar, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RoomType {
  _id: string;
  name: string;
  description: string;
  price: number;
  amenities: string[];
  maxGuests: number;
  image?: string;
}

// Unsplash room image URLs - Different room types
const unsplashImages = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590073242678-8ef9e4c44b5c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1631889993954-7b603c6f46b2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590073242678-8ef9e4c44b5c?w=800&h=600&fit=crop',
];

export default function ExploreRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('');

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchQuery, priceFilter, selectedAmenity, roomTypes]);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/room-types');
      const data = await response.json();
      
      if (response.ok) {
        setRoomTypes(data.roomTypes || []);
        setFilteredRooms(data.roomTypes || []);
      } else {
        toast.error('Failed to load rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = [...roomTypes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter) {
      filtered = filtered.filter(room => room.price <= priceFilter);
    }

    // Amenity filter
    if (selectedAmenity) {
      filtered = filtered.filter(room =>
        room.amenities.some(amenity =>
          amenity.toLowerCase().includes(selectedAmenity.toLowerCase())
        )
      );
    }

    setFilteredRooms(filtered);
  };

  const getRoomImage = (index: number) => {
    return unsplashImages[index % unsplashImages.length];
  };

  const getAllAmenities = () => {
    const amenitiesSet = new Set<string>();
    roomTypes.forEach(room => {
      room.amenities.forEach(amenity => amenitiesSet.add(amenity));
    });
    return Array.from(amenitiesSet);
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('parking')) return <Car className="w-4 h-4" />;
    if (lower.includes('restaurant') || lower.includes('dining')) return <UtensilsCrossed className="w-4 h-4" />;
    if (lower.includes('pool') || lower.includes('spa')) return <Waves className="w-4 h-4" />;
    if (lower.includes('tv')) return <Tv className="w-4 h-4" />;
    if (lower.includes('ac') || lower.includes('air')) return <Wind className="w-4 h-4" />;
    if (lower.includes('coffee')) return <Coffee className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-pink-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              Explore Our <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Luxurious Rooms</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover elegant spaces designed for your comfort and relaxation
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div className="md:w-48">
              <select
                value={priceFilter || ''}
                onChange={(e) => setPriceFilter(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Prices</option>
                <option value="100">Under $100</option>
                <option value="200">Under $200</option>
                <option value="300">Under $300</option>
                <option value="500">Under $500</option>
                <option value="1000">Under $1000</option>
              </select>
            </div>

            {/* Amenity Filter */}
            <div className="md:w-48">
              <select
                value={selectedAmenity}
                onChange={(e) => setSelectedAmenity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Amenities</option>
                {getAllAmenities().map((amenity, idx) => (
                  <option key={idx} value={amenity}>{amenity}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-gray-400 text-sm">
            Showing {filteredRooms.length} of {roomTypes.length} rooms
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <Bed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No rooms found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          /* Rooms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room, index) => (
              <div
                key={room._id}
                className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getRoomImage(index)}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white font-bold text-lg">{room.price}</span>
                      <span className="text-gray-300 text-sm">/night</span>
                    </div>
                  </div>

                  {/* Max Guests Badge */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-semibold">{room.maxGuests} Guests</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{room.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{room.description}</p>

                  {/* Amenities */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700"
                        >
                          <span className="text-blue-400">{getAmenityIcon(amenity)}</span>
                          <span className="text-gray-300 text-xs">{amenity}</span>
                        </div>
                      ))}
                      {room.amenities.length > 4 && (
                        <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                          <span className="text-gray-400 text-xs">+{room.amenities.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/book?roomType=${room._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 rounded-xl transition-all font-semibold transform hover:scale-105"
                    >
                      Book Now
                    </Link>
                    <Link
                      href={`/explore-rooms/${room._id}`}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 hover:border-slate-600"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience luxury and comfort like never before. Book your perfect room today!
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Book Your Room
          </Link>
        </div>
      </div>
    </div>
  );
}

