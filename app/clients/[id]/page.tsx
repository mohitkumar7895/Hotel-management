'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Building2, Image as ImageIcon, Mail, Phone, Globe, MapPin, FileText } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  website?: string;
  logo?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${id}`);
      if (response.ok) {
        const result = await response.json();
        setClient(result.client);
      } else {
        alert('Client not found');
        router.push('/clients');
      }
    } catch (error) {
      console.error('Failed to fetch client:', error);
      alert('Failed to fetch client');
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/clients');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Back Button */}
        <Link 
          href="/clients" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2 sm:mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </Link>

        {/* Header Card */}
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">Client Details</h1>
              <p className="text-gray-400">View and manage client information</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/clients/${id}/edit`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                title="Edit Client"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Client</span>
                <span className="sm:hidden">Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                title="Delete Client"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Client Information Card */}
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-center h-64 bg-[#0f172a] rounded-lg border border-[#334155] mb-4">
              {client.logo ? (
                <img
                  src={`${client.logo}?t=${Date.now()}`}
                  alt={client.name}
                  className="max-h-60 max-w-full object-contain p-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex flex-col items-center justify-center text-gray-500">
                          <svg class="w-20 h-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span class="text-sm">No Logo</span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon className="w-20 h-20 mb-2" />
                  <span className="text-sm">No Logo</span>
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">{client.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.contactPerson && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Contact Person</p>
                    <p className="text-white">{client.contactPerson}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                    >
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </p>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.website && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </p>
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                    >
                      {client.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {client.address && (
              <div>
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </p>
                <p className="text-white">{client.address}</p>
              </div>
            )}

            {/* Description */}
            {client.description && (
              <div>
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </p>
                <p className="text-white whitespace-pre-wrap">{client.description}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-[#334155]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {client.createdAt && (
                  <div>
                    <p className="text-gray-400 mb-1">Created At</p>
                    <p className="text-white">
                      {new Date(client.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {client.updatedAt && (
                  <div>
                    <p className="text-gray-400 mb-1">Last Updated</p>
                    <p className="text-white">
                      {new Date(client.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

