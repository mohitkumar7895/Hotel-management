'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createRoomType } from '@/app/actions/roomTypes';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const roomTypeSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Price must be a valid number',
  }),
  amenities: z.string(),
  maxGuests: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 1, {
    message: 'Max guests must be at least 1',
  }),
});

type RoomTypeForm = z.infer<typeof roomTypeSchema>;

const roomTypeOptions = [
  'Single Room',
  'Double Room',
  'Twin Room',
  'Deluxe Room',
  'Super Deluxe',
  'Suite',
  'Family Room',
  'King Room',
  'Queen Room',
];

export default function NewRoomTypePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [customRoomType, setCustomRoomType] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<RoomTypeForm>({
    resolver: zodResolver(roomTypeSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setValue('image', file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RoomTypeForm) => {
    setIsLoading(true);
    
    // Manual validation
    const actualName = selectedRoomType === 'custom' ? customRoomType : selectedRoomType;
    
    if (!actualName || actualName.trim() === '') {
      toast.error('Room type name is required');
      setIsLoading(false);
      return;
    }

    if (!data.description || data.description.trim() === '') {
      toast.error('Description is required');
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = '';

      // Upload image if selected
      if (selectedImage) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', selectedImage);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            toast.error(errorData.error || 'Failed to upload image');
            setIsLoading(false);
            return;
          }

          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload image. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('name', actualName.trim());
      formData.append('description', (data.description || '').trim());
      formData.append('price', data.price || '0');
      formData.append('amenities', data.amenities || '');
      formData.append('maxGuests', data.maxGuests || '1');
      if (imageUrl) {
        formData.append('image', imageUrl);
      }

      const result = await createRoomType(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Room type created successfully!');
        window.location.href = '/room-types';
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/room-types" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Room Types</span>
      </Link>

      {/* Header Card */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Create Room Type</h1>
        <p className="text-gray-400">Add a new room type to your system</p>
      </div>

      {/* Form Card */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Room Type Name
            </label>
            <div>
              <select
                id="name"
                value={selectedRoomType}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedRoomType(newValue);
                  if (newValue !== 'custom') {
                    setCustomRoomType('');
                  }
                }}
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="">Select a room type</option>
                {roomTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value="custom">Other (Custom)</option>
              </select>
              {selectedRoomType === 'custom' && (
                <input
                  type="text"
                  value={customRoomType}
                  onChange={(e) => {
                    setCustomRoomType(e.target.value);
                  }}
                  placeholder="Enter custom room type"
                  className="w-full mt-2 px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Describe the room type..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                Price per Night ($)
              </label>
              <input
                {...register('price')}
                type="number"
                id="price"
                step="0.01"
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-300 mb-2">
                Max Guests
              </label>
              <input
                {...register('maxGuests')}
                type="number"
                id="maxGuests"
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="2"
              />
              {errors.maxGuests && (
                <p className="mt-1 text-sm text-red-400">{errors.maxGuests.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="amenities" className="block text-sm font-medium text-gray-300 mb-2">
              Amenities (comma-separated)
            </label>
            <input
              {...register('amenities')}
              type="text"
              id="amenities"
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="WiFi, TV, AC, Mini Bar"
            />
            {errors.amenities && (
              <p className="mt-1 text-sm text-red-400">{errors.amenities.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
              Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs h-48 object-cover rounded-lg border border-[#334155]"
                />
              </div>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-400">{errors.image.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Supported formats: JPEG, PNG, WEBP, GIF (Max 5MB)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Room Type'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}


