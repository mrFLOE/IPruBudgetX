'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { requestsAPI, approvalsAPI, adminAPI } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      if (user?.role === 'SUPER_ADMIN') {
        const statsRes = await adminAPI.getStats();
        setStats(statsRes.data);
      }

      if (user?.role === 'REQUESTOR' || user?.role === 'SUPER_ADMIN') {
        const requestsRes = await requestsAPI.getAll();
        setRecentRequests(requestsRes.data.slice(0, 5));
      }

      if (['TECH_LEAD', 'DEPT_HEAD', 'FINANCE_ADMIN', 'FPNA', 'PRINCIPAL_FINANCE', 'CFO', 'SUPER_ADMIN'].includes(user?.role || '')) {
        const approvalsRes = await approvalsAPI.getPending();
        setPendingApprovals(approvalsRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      DRAFT: 'badge-info',
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
      REWORK: 'badge-warning',
      FINAL_APPROVED: 'badge-success',
    };
    return badges[status] || 'badge-info';
  };

  if (loading || loadingData) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Role: {user?.role}</p>
      </div>

      {user?.role === 'SUPER_ADMIN' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-4xl font-bold">{stats.total_users}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Requests</h3>
            <p className="text-4xl font-bold">{stats.total_requests}</p>
          </div>
          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
            <p className="text-4xl font-bold">{stats.pending_requests}</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Departments</h3>
            <p className="text-4xl font-bold">{stats.total_departments}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(user?.role === 'REQUESTOR' || user?.role === 'SUPER_ADMIN') && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
              <Link href="/requests" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                View All →
              </Link>
            </div>
            {recentRequests.length === 0 ? (
              <p className="text-gray-500">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{request.category}</p>
                        <p className="text-sm text-gray-600">
                          ${request.amount.toLocaleString()} - {request.type}
                        </p>
                      </div>
                      <span className={`${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {['TECH_LEAD', 'DEPT_HEAD', 'FINANCE_ADMIN', 'FPNA', 'PRINCIPAL_FINANCE', 'CFO', 'SUPER_ADMIN'].includes(user?.role || '') && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
              <Link href="/approvals" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                View All →
              </Link>
            </div>
            {pendingApprovals.length === 0 ? (
              <p className="text-gray-500">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((request) => (
                  <div key={request.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{request.category}</p>
                    <p className="text-sm text-gray-600">
                      ${request.amount.toLocaleString()} - {request.requester_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{request.department_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {(user?.role === 'REQUESTOR' || user?.role === 'SUPER_ADMIN') && (
          <Link href="/requests/new" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">📝</div>
              <h3 className="font-bold text-gray-900">Create New Request</h3>
              <p className="text-sm text-gray-600 mt-2">Submit a new budget request</p>
            </div>
          </Link>
        )}

        {['TECH_LEAD', 'DEPT_HEAD', 'FINANCE_ADMIN', 'FPNA', 'PRINCIPAL_FINANCE', 'CFO', 'SUPER_ADMIN'].includes(user?.role || '') && (
          <Link href="/approvals" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-bold text-gray-900">Review Approvals</h3>
              <p className="text-sm text-gray-600 mt-2">Approve or reject requests</p>
            </div>
          </Link>
        )}

        <Link href="/status" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-bold text-gray-900">System Status</h3>
            <p className="text-sm text-gray-600 mt-2">Check system health</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
