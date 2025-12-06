'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Phone, User as UserIcon, Calendar, Shield, CheckCircle2, Clock, Star, Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profileImage?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Add cache-busting to ensure fresh data
        const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          toast.error('Please login to continue');
          router.push('/login');
          return;
        }

        const data = await response.json();
        console.log('Profile data fetched:', data.user);
        console.log('Profile image URL:', data.user?.profileImage);
        setUser(data.user);
        // Always set preview image from user data - this ensures it persists
        const imageUrl = data.user?.profileImage;
        if (imageUrl) {
          console.log('Setting preview image from user data:', imageUrl);
          setPreviewImage(imageUrl);
        } else {
          console.log('No profile image found');
          setPreviewImage(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load profile');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Refresh when page becomes visible (user comes back from edit page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };
    
    // Also refresh on focus (when user switches tabs back)
    const handleFocus = () => {
      fetchUser();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Upload image immediately
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', user?.name || '');
      formData.append('email', user?.email || '');
      if (user?.phone) {
        formData.append('phone', user.phone);
      }
      formData.append('profileImage', file);

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to update profile image');
      } else {
        toast.success('Profile image updated successfully!');
        // Update user state with new image immediately
        if (result.user && result.user.profileImage) {
          const newImageUrl = result.user.profileImage;
          console.log('✅ New image URL received from MongoDB:', newImageUrl);
          
          // Update user state FIRST
          const updatedUser = { ...user!, profileImage: newImageUrl };
          setUser(updatedUser);
          console.log('✅ User state updated with image:', updatedUser.profileImage);
          
          // Then update preview with the server URL - this will persist
          setPreviewImage(newImageUrl);
          console.log('✅ Preview image set to server URL:', newImageUrl);
          
          // Force a small delay to ensure state updates
          setTimeout(() => {
            console.log('✅ Final check - previewImage:', newImageUrl, 'user.profileImage:', updatedUser.profileImage);
          }, 100);
          
          // Notify header to refresh
          window.dispatchEvent(new Event('profileImageUpdated'));
          localStorage.setItem('profileImageUpdated', Date.now().toString());
        } else {
          console.error('❌ No image in response:', result);
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-600/20 text-purple-300 border-purple-600/30';
      case 'manager':
        return 'bg-blue-600/20 text-blue-300 border-blue-600/30';
      default:
        return 'bg-green-600/20 text-green-300 border-green-600/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">View and manage your profile information</p>
        </div>
        <Link
          href="/profile/edit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20"
        >
          <Edit className="w-5 h-5" />
          Edit Profile
        </Link>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#1e293b] to-[#0f172a] rounded-xl border border-[#334155] overflow-hidden shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profileImageUpload"
              />
              <div className="relative cursor-pointer" onClick={handleImageClick}>
                {(() => {
                  const imageToShow = previewImage || user.profileImage;
                  console.log('Rendering image, previewImage:', previewImage, 'user.profileImage:', user.profileImage, 'imageToShow:', imageToShow);
                  
                  if (imageToShow) {
                    const imageSrc = imageToShow.startsWith('data:') 
                      ? imageToShow 
                      : `${imageToShow}?t=${Date.now()}`;
                    
                    return (
                      <img
                        key={`profile-img-${imageToShow}`}
                        src={imageSrc}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-[#1e293b] ring-offset-2 ring-offset-[#0f172a] transition-opacity"
                        style={{ opacity: isUploading ? 0.7 : 1 }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully in UI:', imageSrc);
                        }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', imageSrc);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    );
                  } else {
                    return (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-[#1e293b] ring-offset-2 ring-offset-[#0f172a] group-hover:opacity-80 transition-opacity">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    );
                  }
                })()}
                {/* Upload overlay - Instagram style */}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center pointer-events-none">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1e293b] shadow-lg z-10">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-gray-300 text-lg mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                {user.email}
              </p>
              {user.role && (
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getRoleColor(user.role)} font-medium shadow-lg`}>
                  <Shield className="w-4 h-4" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Card */}
            <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium mb-1">Email Address</p>
                  <p className="text-white font-semibold text-lg">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            {user.phone ? (
              <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/10 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600/20 to-green-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-1">Phone Number</p>
                    <p className="text-white font-semibold text-lg">{user.phone}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-gray-600/50 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-600/20 to-gray-600/10 flex items-center justify-center">
                    <Phone className="w-7 h-7 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-1">Phone Number</p>
                    <p className="text-gray-500 font-semibold text-lg">Not provided</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Card */}
            {user.role && (
              <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-purple-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-1">Account Role</p>
                    <p className="text-white font-semibold text-lg">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Member Since Card */}
            {user.createdAt && (
              <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-yellow-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-600/10 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-600/20 to-yellow-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-1">Member Since</p>
                    <p className="text-white font-semibold text-lg">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-green-600/50 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Account Status</p>
              <p className="text-green-400 font-bold text-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Active
              </p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600/20 to-green-600/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-blue-600/50 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Profile Completion</p>
              <p className="text-blue-400 font-bold text-xl">
                {user.phone ? '100%' : '75%'}
              </p>
              <div className="mt-2 w-full bg-[#0f172a] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${user.phone ? 'bg-blue-600' : 'bg-blue-600'} ${user.phone ? 'w-full' : 'w-3/4'}`}
                ></div>
              </div>
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/10 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-lg border border-[#334155] p-6 hover:border-purple-600/50 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Account Type</p>
              <p className="text-purple-400 font-bold text-xl flex items-center gap-2">
                <Star className="w-5 h-5" />
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Standard'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 flex items-center justify-center">
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
