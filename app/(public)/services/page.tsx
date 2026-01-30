'use client';

import Link from 'next/link';
import { 
  Clock, UtensilsCrossed, Shield, Award, Calendar, Users, 
  Wifi, Car, Waves, Tv, Wind, Coffee, Sparkles,
  Plane, Gift, ArrowLeft, CheckCircle, Star, Phone, Mail, MapPin
} from 'lucide-react';

const services = [
  {
    icon: <Clock className="w-8 h-8" />,
    title: '24/7 Concierge Service',
    description: 'Our dedicated concierge team is available around the clock to assist with restaurant reservations, event planning, transportation arrangements, and any special requests you may have.',
    features: ['Restaurant Reservations', 'Event Planning', 'Transportation', 'Local Recommendations'],
    color: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop'
  },
  {
    icon: <UtensilsCrossed className="w-8 h-8" />,
    title: 'Fine Dining & Room Service',
    description: 'Experience culinary excellence at our award-winning restaurants. Enjoy gourmet meals delivered directly to your room, available 24/7 for your convenience.',
    features: ['Award-Winning Cuisine', '24/7 Room Service', 'Private Dining', 'Dietary Accommodations'],
    color: 'from-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Business Center',
    description: 'Fully equipped business facilities with high-speed internet, meeting rooms, printing services, and professional support staff to ensure your business needs are met.',
    features: ['Meeting Rooms', 'High-Speed Internet', 'Printing Services', 'Professional Support'],
    color: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: 'Fitness Center',
    description: 'State-of-the-art fitness facilities with modern equipment, personal training services, and group fitness classes to keep you active during your stay.',
    features: ['Modern Equipment', 'Personal Training', 'Group Classes', '24/7 Access'],
    color: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
  },
  {
    icon: <Waves className="w-8 h-8" />,
    title: 'Spa & Wellness',
    description: 'Rejuvenate your mind and body at our luxurious spa. Indulge in massages, facials, and wellness treatments designed to relax and restore.',
    features: ['Massage Therapy', 'Facial Treatments', 'Wellness Programs', 'Relaxation Areas'],
    color: 'from-teal-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop'
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Event & Conference Facilities',
    description: 'Perfect venues for weddings, conferences, and special events. Our professional event planning team ensures every detail is executed flawlessly.',
    features: ['Wedding Venues', 'Conference Rooms', 'Event Planning', 'Catering Services'],
    color: 'from-indigo-500 to-purple-500',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Laundry & Dry Cleaning',
    description: 'Professional laundry and dry cleaning services available daily. Same-day service available for your convenience.',
    features: ['Same-Day Service', 'Dry Cleaning', 'Pressing', 'Express Service'],
    color: 'from-amber-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop'
  },
  {
    icon: <Plane className="w-8 h-8" />,
    title: 'Airport Transfer',
    description: 'Complimentary airport shuttle service and private car arrangements available. Let us handle your transportation needs.',
    features: ['Airport Shuttle', 'Private Cars', 'Luxury Vehicles', '24/7 Service'],
    color: 'from-blue-600 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
  },
  {
    icon: <Gift className="w-8 h-8" />,
    title: 'Special Packages',
    description: 'Exclusive packages for honeymoons, anniversaries, business travelers, and families. Customized experiences tailored to your needs.',
    features: ['Honeymoon Packages', 'Family Packages', 'Business Packages', 'Custom Experiences'],
    color: 'from-pink-500 to-rose-500',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop'
  }
];

const amenities = [
  { icon: <Wifi className="w-6 h-6" />, name: 'Free High-Speed WiFi' },
  { icon: <Car className="w-6 h-6" />, name: 'Complimentary Parking' },
  { icon: <Tv className="w-6 h-6" />, name: 'Smart TV & Streaming' },
  { icon: <Wind className="w-6 h-6" />, name: 'Climate Control' },
  { icon: <Coffee className="w-6 h-6" />, name: 'In-Room Coffee & Tea' },
  { icon: <Sparkles className="w-6 h-6" />, name: 'Luxury Toiletries' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-pink-900/60 border-b border-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-4 inline-block">
              Our Services
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Premium <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience world-class amenities and exceptional service designed to make your stay unforgettable
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                <div className={`absolute top-4 left-4 inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} shadow-lg`}>
                  <div className="text-white">{service.icon}</div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Section */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Amenities</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              Additional <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Amenities</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need for a comfortable and convenient stay
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all text-center"
              >
                <div className="text-blue-400 mb-3 flex justify-center">{amenity.icon}</div>
                <p className="text-white text-sm font-medium">{amenity.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience Our Services?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Book your stay today and enjoy world-class amenities and exceptional service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Book Your Stay
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20 hover:border-white/40"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


