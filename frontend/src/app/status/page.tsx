'use client';

import { useEffect, useState } from 'react';
import { healthAPI } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

export default function StatusPage() {
  const { theme } = useTheme();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const response = await healthAPI.check();
      setHealth(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndicator = (status: string) => {
    if (status === 'healthy' || status === 'connected') {
      return <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>;
    }
    return <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">System Status</h1>

      {error ? (
        <div className="card bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚠️</span>
            <div>
              <h3 className="text-xl font-bold text-red-900 dark:text-red-200">System Error</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overall Status</h2>
              <div className="flex items-center gap-2">
                {getStatusIndicator(health?.status)}
                <span className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">{health?.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-primary-500 dark:border-primary-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Service</h3>
                <p className="text-gray-600 dark:text-gray-400">{health?.service}</p>
              </div>
              <div className="border-l-4 border-green-500 dark:border-green-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Version</h3>
                <p className="text-gray-600 dark:text-gray-400">{health?.version}</p>
              </div>
              <div className="border-l-4 border-blue-500 dark:border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Database</h3>
                <div className="flex items-center gap-2">
                  {getStatusIndicator(health?.database)}
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{health?.database}</p>
                </div>
              </div>
              <div className="border-l-4 border-accent-500 dark:border-accent-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Current Theme</h3>
                <p className="text-gray-600 dark:text-gray-400 capitalize">{theme} mode</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">System Information</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">API Endpoint</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Features</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ JWT Authentication</li>
                  <li>✓ Role-Based Access Control (8 roles)</li>
                  <li>✓ 6-Tier Approval Workflow</li>
                  <li>✓ AI-Powered Excel Import (Gemini)</li>
                  <li>✓ Complete Audit Trail</li>
                  <li>✓ Database Switching Support</li>
                  <li>✓ Dark/Light Theme Support</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Documentation</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• API Documentation: See API_DOCUMENTATION.md</p>
                  <p>• Deployment Guide: See DEPLOYMENT.md</p>
                  <p>• Project Summary: See PROJECT_SUMMARY.md</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 card bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <span className="text-3xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Production Deployment</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This application is ready for production deployment on Vercel (frontend) and Render (backend).
                  See DEPLOYMENT.md for complete instructions.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
