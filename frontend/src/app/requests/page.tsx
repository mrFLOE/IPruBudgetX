'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { requestsAPI } from '@/lib/api';
import Link from 'next/link';

export default function RequestsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
    }
  }, [isAuthenticated]);

  const loadRequests = async () => {
    try {
      const response = await requestsAPI.getAll();
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
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

  const filteredRequests = requests.filter((req) => {
    if (filter === 'ALL') return true;
    return req.status === filter;
  });

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Budget Requests</h1>
        {(user?.role === 'REQUESTOR' || user?.role === 'SUPER_ADMIN') && (
          <Link href="/requests/new" className="btn-primary">
            + New Request
          </Link>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'REWORK', 'FINAL_APPROVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{request.category}</h3>
                    <span className={`badge ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="badge badge-info">{request.type}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600 mb-2">
                    ${request.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-600 mb-2">{request.justification}</p>
                  <div className="text-sm text-gray-500">
                    <p>Requester: {request.requester_name}</p>
                    <p>Department: {request.department_name}</p>
                    <p>Created: {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/requests/${request.id}`}
                    className="btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
