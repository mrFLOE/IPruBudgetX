'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usersAPI } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const approvalHierarchy = [
    { level: 1, role: 'REQUESTOR', description: 'Creates budget requests' },
    { level: 2, role: 'TECH_LEAD', description: 'Technical approval' },
    { level: 3, role: 'DEPT_HEAD', description: 'Department approval' },
    { level: 4, role: 'FINANCE_ADMIN', description: 'Finance review' },
    { level: 5, role: 'FPNA', description: 'Financial planning approval' },
    { level: 6, role: 'PRINCIPAL_FINANCE', description: 'Principal finance approval' },
    { level: 7, role: 'CFO', description: 'Final approval' },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    setMessage('Theme updated successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await usersAPI.changePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      setMessage('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getUserHierarchyLevel = () => {
    return approvalHierarchy.find((h) => h.role === user?.role)?.level || 0;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>

      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={user.name}
                disabled
                className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={user.role.replace(/_/g, ' ')}
                disabled
                className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <input
                type="text"
                value={user.department_id || 'Not assigned'}
                disabled
                className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Approval Hierarchy
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your current level: <span className="font-semibold text-primary-600 dark:text-primary-400">Level {getUserHierarchyLevel()} - {user.role.replace(/_/g, ' ')}</span>
          </p>
          <div className="space-y-3">
            {approvalHierarchy.map((level) => (
              <div
                key={level.level}
                className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                  level.role === user.role
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 dark:bg-primary-700 flex items-center justify-center text-white font-bold">
                  {level.level}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {level.role.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
                </div>
                {level.role === user.role && (
                  <div className="flex-shrink-0">
                    <span className="px-3 py-1 bg-primary-600 dark:bg-primary-700 text-white text-sm font-semibold rounded-full">
                      You are here
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Theme Preference</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 p-6 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Light Mode</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bright and clear</span>
              </div>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 p-6 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 mb-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Dark Mode</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Easy on the eyes</span>
              </div>
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field"
                required
                minLength={6}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Minimum 6 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
