'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usersAPI, adminAPI } from '@/lib/api';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'stats'>('users');

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    } else if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, user]);

  const loadAdminData = async () => {
    try {
      const [usersRes, deptsRes, statsRes] = await Promise.all([
        usersAPI.getAll(),
        adminAPI.getDepartments(),
        adminAPI.getStats(),
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId: string) => {
    if (confirm('Are you sure you want to lock this user?')) {
      try {
        await usersAPI.lock(userId);
        await loadAdminData();
      } catch (error) {
        alert('Failed to lock user');
      }
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await usersAPI.unlock(userId);
      await loadAdminData();
    } catch (error) {
      alert('Failed to unlock user');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

      <div className="card mb-6">
        <div className="flex gap-4 border-b">
          {(['users', 'departments', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          </div>
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className="card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{u.name}</h3>
                    <p className="text-gray-600">{u.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge badge-info">{u.role}</span>
                      {u.is_locked && <span className="badge badge-danger">LOCKED</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {u.is_locked ? (
                      <button
                        onClick={() => handleUnlockUser(u.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Unlock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLockUser(u.id)}
                        className="btn-danger"
                      >
                        Lock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="card">
                <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(dept.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-4xl font-bold">{stats.total_users}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Requests</h3>
              <p className="text-4xl font-bold">{stats.total_requests}</p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Pending</h3>
              <p className="text-4xl font-bold">{stats.pending_requests}</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Approved</h3>
              <p className="text-4xl font-bold">{stats.approved_requests}</p>
            </div>
            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Rejected</h3>
              <p className="text-4xl font-bold">{stats.rejected_requests}</p>
            </div>
            <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Departments</h3>
              <p className="text-4xl font-bold">{stats.total_departments}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
