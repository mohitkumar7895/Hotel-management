'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bed, Wifi, Car, UtensilsCrossed, Waves, MapPin, Phone, Mail, Star, 
  CheckCircle, ArrowRight, Shield, Clock, Award, Users, Calendar,
  ChevronLeft, ChevronRight, Instagram, Facebook, Twitter,
  Linkedin, Youtube, CreditCard, Lock, HelpCircle, FileText, 
  Gift, TrendingUp, Globe, Send
} from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const rooms = [
    { 
      name: 'Deluxe Room', 
      price: '$150', 
      originalPrice: '$200',
      features: ['King Bed', 'City View', 'Mini Bar', 'Free WiFi'],
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
      size: '350 sq ft'
    },
    { 
      name: 'Executive Suite', 
      price: '$250', 
      originalPrice: '$300',
      features: ['Living Area', 'Balcony', 'Jacuzzi', 'Room Service'],
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
      size: '550 sq ft'
    },
    { 
      name: 'Presidential Suite', 
      price: '$500', 
      originalPrice: '$650',
      features: ['Private Pool', 'Butler Service', '360° View', 'Premium Amenities'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      size: '1200 sq ft'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="#home" className="flex items-center space-x-3 group">
              <div className="relative">
                <Bed className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl group-hover:bg-blue-300/30 transition"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Luxury Hotel
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors font-medium">Home</Link>
              <Link href="/explore-rooms" className="text-gray-300 hover:text-white transition-colors font-medium">Rooms</Link>
              <Link href="/services" className="text-gray-300 hover:text-white transition-colors font-medium">Services</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors font-medium">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2">
                Login
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 font-semibold">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-pink-900/60"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')] bg-cover bg-center opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-block mb-6">
            <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold border border-blue-500/30">
              ✨ Experience Luxury Like Never Before
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-5 md:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="text-white">Luxury Hotel</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience unparalleled comfort and world-class hospitality in the heart of the city
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/book" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/50 flex items-center gap-2">
              Book Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/explore-rooms" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all border border-white/20 hover:border-white/40 flex items-center gap-2">
              Explore Rooms
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16 max-w-2xl mx-auto">
            {[
              { number: '500+', label: 'Happy Guests' },
              { number: '50+', label: 'Luxury Rooms' },
              { number: '5★', label: 'Rating' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-gray-400 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-20 bg-slate-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')] bg-cover bg-center"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-3">
              Experience <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Luxury</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Welcome to Luxury Hotel, where elegance meets comfort and exceptional service
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div>
              <p className="text-gray-300 mb-4 text-base leading-relaxed">
                Located in the heart of the city, we offer world-class amenities and exceptional service 
                to make your stay unforgettable. Our hotel features beautifully designed rooms, fine dining 
                restaurants, a luxurious spa, and state-of-the-art facilities for both business and leisure travelers.
              </p>
              <p className="text-gray-300 mb-5 text-base leading-relaxed">
                With over a decade of excellence, we've built a reputation for providing unparalleled 
                hospitality and creating memorable experiences for our guests from around the world.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
                  <div className="text-2xl font-bold text-white mb-1">500+</div>
                  <div className="text-gray-400 text-xs">Happy Guests</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
                  <div className="text-2xl font-bold text-white mb-1">50+</div>
                  <div className="text-gray-400 text-xs">Luxury Rooms</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
                  <div className="text-2xl font-bold text-white mb-1">10+</div>
                  <div className="text-gray-400 text-xs">Years Experience</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-white font-semibold">5.0 Rating</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/book" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105">
                  Book Your Stay
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/about" className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all border border-slate-700">
                  Learn More
                </Link>
              </div>
            </div>
            
            {/* Image Section */}
            <div className="relative">
              <div className="relative h-64 lg:h-72 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop"
                  alt="Luxury Hotel"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-16 md:py-20 bg-slate-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')] bg-cover bg-center"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Accommodations</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-3">
              Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Luxurious Rooms</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Elegant spaces designed for your comfort and relaxation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {rooms.map((room, idx) => (
              <div key={idx} className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="relative h-56 md:h-60 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-semibold">Popular</span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{room.name}</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-white">{room.price}</span>
                      <span className="text-gray-300 text-sm">/night</span>
                      <span className="text-gray-400 line-through text-sm">{room.originalPrice}</span>
                    </div>
                    <div className="text-gray-200 text-sm">{room.size}</div>
                  </div>
                </div>
                <div className="p-5">
                  <ul className="space-y-2 mb-4">
                    {room.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/book" className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 rounded-xl transition-all font-semibold transform hover:scale-105 shadow-lg shadow-blue-500/50">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Rooms CTA */}
          <div className="text-center mt-8">
            <Link href="/explore-rooms" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              View All Rooms
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')] bg-cover bg-center"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Services</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-3">
              Premium <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need for a perfect stay
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: <Clock className="w-6 h-6" />, 
                title: '24/7 Concierge', 
                desc: 'Round-the-clock assistance for all your needs',
                image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: <UtensilsCrossed className="w-6 h-6" />, 
                title: 'Room Service', 
                desc: 'Delicious meals delivered to your room',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                color: 'from-orange-500 to-red-500'
              },
              { 
                icon: <Shield className="w-6 h-6" />, 
                title: 'Business Center', 
                desc: 'Fully equipped for your business needs',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                icon: <Award className="w-6 h-6" />, 
                title: 'Fitness Center', 
                desc: 'State-of-the-art gym facilities',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                icon: <Calendar className="w-6 h-6" />, 
                title: 'Event Hall', 
                desc: 'Perfect venue for weddings and conferences',
                image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
                color: 'from-indigo-500 to-purple-500'
              },
              { 
                icon: <Users className="w-6 h-6" />, 
                title: 'Laundry Service', 
                desc: 'Professional cleaning and pressing',
                image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
                color: 'from-amber-500 to-orange-500'
              },
            ].map((service, idx) => (
              <div key={idx} className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                  <div className={`absolute top-4 right-4 inline-flex p-3 rounded-lg bg-gradient-to-br ${service.color} shadow-lg`}>
                    <div className="text-white">{service.icon}</div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400 text-sm">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Services CTA */}
          <div className="text-center mt-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              View All Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

{/* Contact Section */}
      <section id="contact" className="py-12 md:py-16 bg-slate-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')] bg-cover bg-center"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider">Contact</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-2">
              Get In <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              We'd love to hear from you. Reach out to us anytime!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { 
                icon: <MapPin className="w-6 h-6" />, 
                title: 'Address', 
                content: '123 Luxury Street\nCity, State 12345',
                color: 'from-blue-500 to-cyan-500',
                image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop'
              },
              { 
                icon: <Phone className="w-6 h-6" />, 
                title: 'Phone', 
                content: '+1 (555) 123-4567\n24/7 Support',
                color: 'from-green-500 to-emerald-500',
                image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=300&fit=crop'
              },
              { 
                icon: <Mail className="w-6 h-6" />, 
                title: 'Email', 
                content: 'info@luxuryhotel.com\nreservations@luxuryhotel.com',
                color: 'from-purple-500 to-pink-500',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
              >
                {/* Background Image */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Content */}
                <div className="relative p-5 text-center">
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${item.color} mb-3 shadow-lg`}>
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 whitespace-pre-line leading-relaxed text-xs">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Contact CTA */}
          <div className="text-center mt-6">
            <Link href="/contact" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors text-sm">
              Visit Contact Page
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6 mb-6">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-3">
                <Bed className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Luxury Hotel
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                Experience luxury redefined. Your perfect stay awaits at our world-class hotel.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-xs">123 Luxury Street, City, State 12345</p>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-xs">+1 (555) 123-4567</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-xs">info@luxuryhotel.com</p>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h5 className="text-white font-semibold mb-2 text-xs">Follow Us</h5>
                <div className="flex space-x-2">
                  <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-400 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-700 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Quick Links</h4>
              <ul className="space-y-1.5">
                <li><Link href="/" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Home</span>
                </Link></li>
                <li><Link href="/explore-rooms" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Explore Rooms</span>
                </Link></li>
                <li><Link href="/services" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Services</span>
                </Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>About Us</span>
                </Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Contact</span>
                </Link></li>
                <li><Link href="/book" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Book Now</span>
                </Link></li>
              </ul>
            </div>

            {/* Guest Services */}
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Guest Services</h4>
              <ul className="space-y-1.5">
                <li><Link href="/my-bookings" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>My Bookings</span>
                </Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Check-in/Check-out</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Special Offers</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Gift Cards</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Loyalty Program</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>FAQs</span>
                </a></li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Legal & Support</h4>
              <ul className="space-y-1.5">
                <li><Link href="/login" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Login</span>
                </Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Register</span>
                </Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Privacy Policy</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Terms & Conditions</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Cancellation Policy</span>
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Help Center</span>
                </a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-slate-800 pt-4 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <div>
                <h4 className="text-white font-semibold mb-1 text-sm">Subscribe to Our Newsletter</h4>
                <p className="text-gray-400 text-xs">Get exclusive offers and updates delivered to your inbox.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 text-sm">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              </div>
            </div>
          </div>

          {/* Payment Methods & Trust Badges */}
          <div className="border-t border-slate-800 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Payment Methods */}
              <div>
                <h5 className="text-white font-semibold mb-2 text-xs">We Accept</h5>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-xs">Visa</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-xs">Mastercard</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-xs">Amex</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-xs">PayPal</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div>
                <h5 className="text-white font-semibold mb-2 text-xs">Certified & Secure</h5>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-xs">SSL Secured</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-xs">Verified</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400 text-xs">5-Star</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <p>© 2024 Luxury Hotel. All rights reserved.</p>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  <span>English</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <a href="#" className="text-gray-400 hover:text-white transition">Sitemap</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Accessibility</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Careers</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
