'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Bed, Users, Wifi, Car, UtensilsCrossed, 
  Waves, Tv, Wind, Coffee, CheckCircle, Star, DollarSign, 
  Calendar, MapPin, Phone, Mail, Share2, Heart, Maximize2,
  X, ChevronLeft, ChevronRight
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

// Multiple Unsplash images for each room type
const roomImages = {
  default: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop',
  ],
  deluxe: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=800&fit=crop',
  ],
  executive: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1590073242678-8ef9e4c44b5c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop',
  ],
  presidential: [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1631889993954-7b603c6f46b2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1590073242678-8ef9e4c44b5c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop',
  ],
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [params.id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/room-types/${params.id}`);
      const data = await response.json();
      
      if (response.ok && data.roomType) {
        setRoomType(data.roomType);
      } else {
        toast.error('Room not found');
        router.push('/explore-rooms');
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      toast.error('Failed to load room details');
      router.push('/explore-rooms');
    } finally {
      setLoading(false);
    }
  };

  const getRoomImages = () => {
    if (!roomType) return roomImages.default;
    const name = roomType.name.toLowerCase();
    if (name.includes('deluxe')) return roomImages.deluxe;
    if (name.includes('executive')) return roomImages.executive;
    if (name.includes('presidential')) return roomImages.presidential;
    return roomImages.default;
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('parking')) return <Car className="w-5 h-5" />;
    if (lower.includes('restaurant') || lower.includes('dining')) return <UtensilsCrossed className="w-5 h-5" />;
    if (lower.includes('pool') || lower.includes('spa')) return <Waves className="w-5 h-5" />;
    if (lower.includes('tv')) return <Tv className="w-5 h-5" />;
    if (lower.includes('ac') || lower.includes('air')) return <Wind className="w-5 h-5" />;
    if (lower.includes('coffee')) return <Coffee className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: roomType?.name,
        text: roomType?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const nextImage = () => {
    const images = getRoomImages();
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getRoomImages();
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!roomType) {
    return null;
  }

  const images = getRoomImages();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-pink-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/explore-rooms" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rooms</span>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{roomType.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-300 text-sm">5.0 Rating</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-all ${
                  isFavorite 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:text-white transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Main Large Image */}
          <div className="lg:col-span-2 relative group">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden border border-slate-700">
              <img
                src={images[selectedImageIndex]}
                alt={`${roomType.name} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-white text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="absolute bottom-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all"
                aria-label="View fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 gap-4">
            {images.slice(0, 4).map((image, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative h-48 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-blue-500 scale-105'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <img
                  src={image}
                  alt={`${roomType.name} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedImageIndex === idx && (
                  <div className="absolute inset-0 bg-blue-500/20"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Room Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About This Room</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{roomType.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Amenities & Features</h2>
              
              {/* Room Amenities from Database */}
              {roomType.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Room Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomType.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all"
                      >
                        <div className="text-blue-400">{getAmenityIcon(amenity)}</div>
                        <span className="text-gray-300">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Hotel Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Standard Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: <Wifi className="w-5 h-5" />, name: 'Free High-Speed WiFi', category: 'Connectivity' },
                    { icon: <Tv className="w-5 h-5" />, name: '55" Smart TV with Streaming', category: 'Entertainment' },
                    { icon: <Wind className="w-5 h-5" />, name: 'Air Conditioning & Heating', category: 'Climate' },
                    { icon: <Coffee className="w-5 h-5" />, name: 'Coffee & Tea Maker', category: 'Beverages' },
                    { icon: <Bed className="w-5 h-5" />, name: 'Premium Bedding & Linens', category: 'Comfort' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Mini Refrigerator', category: 'Convenience' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'In-Room Safe', category: 'Security' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Work Desk & Chair', category: 'Business' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Iron & Ironing Board', category: 'Convenience' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Hair Dryer', category: 'Bathroom' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Premium Toiletries', category: 'Bathroom' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Bathrobes & Slippers', category: 'Comfort' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: '24/7 Room Service', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Daily Housekeeping', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Wake-Up Service', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Laundry Service', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Concierge Service', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Blackout Curtains', category: 'Comfort' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Soundproofing', category: 'Comfort' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'USB Charging Ports', category: 'Connectivity' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'LED Reading Lights', category: 'Lighting' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'City View / Garden View', category: 'View' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Balcony / Terrace', category: 'Space' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Private Bathroom', category: 'Bathroom' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Bathtub / Shower', category: 'Bathroom' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Separate Living Area', category: 'Space' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Dining Table', category: 'Space' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Sofa / Seating Area', category: 'Comfort' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Wardrobe & Closet', category: 'Storage' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Luggage Rack', category: 'Storage' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Mirror (Full Length)', category: 'Bathroom' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Telephone', category: 'Communication' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Alarm Clock', category: 'Convenience' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Newspaper Delivery', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Turndown Service', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Express Check-in/Check-out', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Complimentary Water', category: 'Beverages' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Welcome Amenities', category: 'Service' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Smoke-Free Room', category: 'Health' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Air Purifier', category: 'Health' },
                    { icon: <CheckCircle className="w-5 h-5" />, name: 'Non-Smoking', category: 'Health' },
                  ].map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all"
                    >
                      <div className="text-blue-400 flex-shrink-0">{amenity.icon}</div>
                      <div className="flex-1">
                        <span className="text-gray-300 block">{amenity.name}</span>
                        <span className="text-gray-500 text-xs">{amenity.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Features */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Room Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">{roomType.maxGuests}</div>
                  <div className="text-gray-400 text-sm">Max Guests</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
                  <Bed className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">King</div>
                  <div className="text-gray-400 text-sm">Bed Type</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
                  <Tv className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">55"</div>
                  <div className="text-gray-400 text-sm">Smart TV</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">${roomType.price}</span>
                  <span className="text-gray-400">/night</span>
                </div>
                <p className="text-gray-400 text-sm">Taxes and fees included</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Guests</span>
                  <span className="text-white font-semibold">{roomType.maxGuests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Room Size</span>
                  <span className="text-white font-semibold">350-550 sq ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">5.0</span>
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              <Link
                href={`/book?roomType=${roomType._id}`}
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 mb-4"
              >
                Book Now
              </Link>

              {/* Contact */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>reservations@luxuryhotel.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={prevImage}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <img
            src={images[selectedImageIndex]}
            alt={`${roomType.name} - Full view`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="text-white text-sm">
              {selectedImageIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

