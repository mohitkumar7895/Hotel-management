'use client';

import Link from 'next/link';
import { 
  ArrowLeft, Star, Award, Users, Calendar, Heart, 
  MapPin, Phone, Mail, Instagram, Facebook, Twitter,
  CheckCircle, Target, Sparkles, Shield, TrendingUp
} from 'lucide-react';

const stats = [
  { number: '500+', label: 'Happy Guests', icon: <Users className="w-8 h-8" /> },
  { number: '50+', label: 'Luxury Rooms', icon: <Award className="w-8 h-8" /> },
  { number: '10+', label: 'Years Experience', icon: <Calendar className="w-8 h-8" /> },
  { number: '5★', label: 'Average Rating', icon: <Star className="w-8 h-8" /> },
];

const values = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Hospitality Excellence',
    description: 'We believe in creating genuine connections with our guests and providing personalized service that exceeds expectations.',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Trust & Integrity',
    description: 'Building lasting relationships through transparency, honesty, and unwavering commitment to our guests\' satisfaction.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Innovation',
    description: 'Continuously evolving our services and facilities to provide modern amenities while maintaining timeless elegance.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Sustainability',
    description: 'Committed to environmental responsibility and sustainable practices that protect our planet for future generations.',
    color: 'from-green-500 to-emerald-500'
  },
];

const achievements = [
  'Award-Winning Hotel of the Year 2023',
  'TripAdvisor Travelers\' Choice Award',
  '5-Star Rating from Leading Travel Guides',
  'Certified Green Hotel',
  'Best Business Hotel Award',
  'Excellence in Customer Service',
];

const team = [
  {
    name: 'Management Team',
    description: 'Experienced professionals dedicated to ensuring your perfect stay',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop'
  },
  {
    name: 'Culinary Experts',
    description: 'Award-winning chefs creating exceptional dining experiences',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop'
  },
  {
    name: 'Service Staff',
    description: 'Friendly and professional team members ready to assist you',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
  },
];

export default function AboutPage() {
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
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Welcome to <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Luxury Hotel</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Where elegance meets comfort, and every stay becomes an unforgettable experience
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-6">
              A Legacy of <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Excellence</span>
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg">
                Founded with a vision to redefine luxury hospitality, Luxury Hotel has been serving guests with 
                unparalleled dedication for over a decade. Located in the heart of the city, we combine timeless 
                elegance with modern amenities to create an exceptional experience.
              </p>
              <p>
                Our journey began with a simple belief: every guest deserves to feel special. This philosophy 
                drives everything we do, from the design of our rooms to the training of our staff. We've built 
                a reputation for excellence through attention to detail, personalized service, and a commitment to 
                creating memorable moments.
              </p>
              <p>
                Today, we stand as a symbol of luxury and hospitality, welcoming travelers from around the world 
                and making their stays unforgettable. Our commitment to excellence continues to grow, as we 
                constantly evolve to meet and exceed the expectations of our valued guests.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-white font-semibold text-lg">5.0 Rating</span>
            </div>
          </div>
          <div className="relative">
            <div className="relative h-96 rounded-2xl overflow-hidden border border-slate-700">
              <img
                src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop"
                alt="Hotel Lobby"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-2xl border border-slate-700">
              <div className="text-white">
                <div className="text-3xl font-bold mb-1">10+</div>
                <div className="text-sm opacity-90">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all"
              >
                <div className="text-blue-400 mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Our Values</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            What We <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Stand For</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${value.color} mb-6`}>
                <div className="text-white">{value.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
              <p className="text-gray-300 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Recognition</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              Awards & <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Achievements</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700"
              >
                <Award className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">{achievement}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Our Team</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            Meet Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Expert Team</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Dedicated professionals committed to making your stay exceptional
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all transform hover:scale-105"
            >
              <div className="relative h-64">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-gray-400">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Experience Our Hospitality
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied guests who have made Luxury Hotel their preferred choice
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
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




