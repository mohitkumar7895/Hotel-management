'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Building2, Image as ImageIcon, Users, ImageOff, Clock, Mail, Phone, Globe } from 'lucide-react';

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
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    clientsWithLogo: 0,
    clientsWithoutLogo: 0,
    recentClients: 0,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const result = await response.json();
        const clientsData = result.clients || [];
        setClients(clientsData);
        
        // Calculate stats
        const totalClients = clientsData.length;
        const clientsWithLogo = clientsData.filter((c: Client) => c.logo && c.logo.trim() !== '').length;
        const clientsWithoutLogo = totalClients - clientsWithLogo;
        
        // Recent clients (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentClients = clientsData.filter((c: Client) => {
          if (!c.createdAt) return false;
          const createdDate = new Date(c.createdAt);
          return createdDate >= sevenDaysAgo;
        }).length;

        setStats({
          totalClients,
          clientsWithLogo,
          clientsWithoutLogo,
          recentClients,
        });
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchClients();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
    }
  };

  const handleClientClick = (client: Client) => {
    window.location.href = `/clients/${client._id}`;
  };

  // Get recent clients (last 5)
  const recentClients = clients
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      title: 'With Logo',
      value: stats.clientsWithLogo,
      icon: <ImageIcon className="w-6 h-6" />,
      color: 'bg-green-600',
    },
    {
      title: 'Without Logo',
      value: stats.clientsWithoutLogo,
      icon: <ImageOff className="w-6 h-6" />,
      color: 'bg-yellow-600',
    },
    {
      title: 'Recent (7 Days)',
      value: stats.recentClients,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Clients</h1>
          <p className="text-sm sm:text-base text-gray-400">Manage client information and logos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg transition-colors text-sm sm:text-base border border-[#334155]"
          >
            {showDashboard ? 'Show List' : 'Show Dashboard'}
          </button>
          <Link
            href="/clients/new"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      </div>

      {showDashboard ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-[#1e293b] rounded-lg p-4 sm:p-5 md:p-6 border border-[#334155] hover:border-[#475569] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0`}>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 text-white">{stat.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Clients Section */}
          {recentClients.length > 0 && (
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Clients</h2>
                <Link
                  href="/clients"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDashboard(false);
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div
                    key={client._id}
                    onClick={() => handleClientClick(client)}
                    className="bg-[#0f172a] rounded-lg border border-[#334155] p-4 hover:border-[#475569] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      <div className="w-16 h-16 bg-[#1e293b] border border-[#334155] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {client.logo ? (
                          <img
                            src={`${client.logo}?t=${Date.now()}`}
                            alt={client.name}
                            className="max-h-14 max-w-full object-contain p-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-600" />
                        )}
                      </div>

                      {/* Client Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">
                              {client.name}
                            </h3>
                            {client.contactPerson && (
                              <p className="text-sm text-gray-400 mb-2">Contact: {client.contactPerson}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-400">
                              {client.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <a href={`mailto:${client.email}`} className="hover:text-blue-400">
                                    {client.email}
                                  </a>
                                </div>
                              )}
                              {client.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <a href={`tel:${client.phone}`} className="hover:text-blue-400">
                                    {client.phone}
                                  </a>
                                </div>
                              )}
                              {client.website && (
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <a
                                    href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-400"
                                  >
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              href={`/clients/${client._id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit Client"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => handleDelete(client._id, e)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Clients Grid */}
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">All Clients</h2>
              <span className="text-sm text-gray-400">{clients.length} total</span>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No clients found</p>
                <p className="text-gray-500 text-sm mb-4">Get started by adding your first client</p>
                <Link
                  href="/clients/new"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {clients.map((client) => (
                  <div
                    key={client._id}
                    onClick={() => handleClientClick(client)}
                    className="bg-[#0f172a] rounded-lg border border-[#334155] p-4 sm:p-6 hover:border-[#475569] transition-colors flex flex-col cursor-pointer"
                  >
                    {/* Logo Section */}
                    <div className="flex items-center justify-center mb-4 h-32 bg-[#1e293b] rounded-lg border border-[#334155]">
                      {client.logo ? (
                        <img
                          src={`${client.logo}?t=${Date.now()}`}
                          alt={client.name}
                          className="max-h-28 max-w-full object-contain p-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex flex-col items-center justify-center text-gray-500">
                                  <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <span class="text-xs">No Logo</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <span className="text-xs">No Logo</span>
                        </div>
                      )}
                    </div>

                    {/* Client Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
                          {client.contactPerson && (
                            <p className="text-sm text-gray-400">Contact: {client.contactPerson}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/clients/${client._id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit Client"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(client._id, e)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        {client.email && (
                          <p className="text-gray-300">
                            <span className="text-gray-400">Email:</span>{' '}
                            <a href={`mailto:${client.email}`} className="text-blue-400 hover:underline">
                              {client.email}
                            </a>
                          </p>
                        )}
                        <p className="text-gray-300">
                          <span className="text-gray-400">Phone:</span>{' '}
                          <a href={`tel:${client.phone}`} className="text-blue-400 hover:underline">
                            {client.phone}
                          </a>
                        </p>
                        {client.website && (
                          <p className="text-gray-300">
                            <span className="text-gray-400">Website:</span>{' '}
                            <a
                              href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {client.website}
                            </a>
                          </p>
                        )}
                        {client.address && (
                          <p className="text-gray-300">
                            <span className="text-gray-400">Address:</span> {client.address}
                          </p>
                        )}
                        {client.description && (
                          <p className="text-gray-300 mt-2 line-clamp-2">
                            <span className="text-gray-400">Description:</span> {client.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* List View */
        <>
          {clients.length === 0 ? (
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No clients found</p>
              <p className="text-gray-500 text-sm">Get started by adding your first client</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div
                  key={client._id}
                  onClick={() => handleClientClick(client)}
                  className="bg-[#1e293b] rounded-lg border border-[#334155] p-6 hover:border-[#475569] transition-colors flex flex-col cursor-pointer"
                >
                  {/* Logo Section */}
                  <div className="flex items-center justify-center mb-4 h-32 bg-[#0f172a] rounded-lg border border-[#334155]">
                    {client.logo ? (
                      <img
                        src={`${client.logo}?t=${Date.now()}`}
                        alt={client.name}
                        className="max-h-28 max-w-full object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex flex-col items-center justify-center text-gray-500">
                                <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span class="text-xs">No Logo</span>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-xs">No Logo</span>
                      </div>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
                        {client.contactPerson && (
                          <p className="text-sm text-gray-400">Contact: {client.contactPerson}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clients/${client._id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit Client"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(e) => handleDelete(client._id, e)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      {client.email && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Email:</span>{' '}
                          <a href={`mailto:${client.email}`} className="text-blue-400 hover:underline">
                            {client.email}
                          </a>
                        </p>
                      )}
                      <p className="text-gray-300">
                        <span className="text-gray-400">Phone:</span>{' '}
                        <a href={`tel:${client.phone}`} className="text-blue-400 hover:underline">
                          {client.phone}
                        </a>
                      </p>
                      {client.website && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Website:</span>{' '}
                          <a
                            href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {client.website}
                          </a>
                        </p>
                      )}
                      {client.address && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Address:</span> {client.address}
                        </p>
                      )}
                      {client.description && (
                        <p className="text-gray-300 mt-2 line-clamp-2">
                          <span className="text-gray-400">Description:</span> {client.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
