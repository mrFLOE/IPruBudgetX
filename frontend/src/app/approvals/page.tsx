'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { approvalsAPI } from '@/lib/api';
import Link from 'next/link';

export default function ApprovalsPage() {
  const { user, isAuthenticated } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'rework'>('approve');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadPendingApprovals();
    }
  }, [isAuthenticated]);

  const loadPendingApprovals = async () => {
    try {
      const response = await approvalsAPI.getPending();
      setPendingApprovals(response.data);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (request: any, actionType: 'approve' | 'reject' | 'rework') => {
    setSelectedRequest(request);
    setAction(actionType);
    setComments('');
    setModalOpen(true);
  };

  const submitAction = async () => {
    if (!selectedRequest) return;
    if ((action === 'reject' || action === 'rework') && !comments.trim()) {
      alert('Comments are required for rejection or rework');
      return;
    }

    setActionLoading(selectedRequest.id);
    try {
      if (action === 'approve') {
        await approvalsAPI.approve(selectedRequest.id, comments || undefined);
      } else if (action === 'reject') {
        await approvalsAPI.reject(selectedRequest.id, comments);
      } else {
        await approvalsAPI.rework(selectedRequest.id, comments);
      }
      await loadPendingApprovals();
      setModalOpen(false);
      setSelectedRequest(null);
      setComments('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(null);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve budget requests for your role: {user?.role}</p>
      </div>

      <div className="space-y-4">
        {pendingApprovals.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No pending approvals</p>
          </div>
        ) : (
          pendingApprovals.map((request) => (
            <div key={request.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{request.category}</h3>
                    <span className="badge badge-info">{request.type}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600 mb-3">
                    ${request.amount.toLocaleString()}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-3">
                    <p className="text-gray-700">{request.justification}</p>
                  </div>
                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                    <p>Requester: <span className="font-semibold">{request.requester_name}</span></p>
                    <p>Department: <span className="font-semibold">{request.department_name}</span></p>
                    <p>Created: {new Date(request.created_at).toLocaleDateString()}</p>
                    <p>Status: <span className="font-semibold">{request.status}</span></p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleAction(request, 'approve')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    disabled={actionLoading === request.id}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleAction(request, 'rework')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    disabled={actionLoading === request.id}
                  >
                    ↻ Rework
                  </button>
                  <button
                    onClick={() => handleAction(request, 'reject')}
                    className="btn-danger"
                    disabled={actionLoading === request.id}
                  >
                    ✗ Reject
                  </button>
                  <Link
                    href={`/requests/${request.id}`}
                    className="btn-secondary text-center"
                  >
                    View Timeline
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Request Rework'} Request
            </h3>
            <p className="text-gray-600 mb-4">
              Request: <strong>{selectedRequest.category}</strong> - ${selectedRequest.amount.toLocaleString()}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments {(action === 'reject' || action === 'rework') && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={action === 'approve' ? 'Optional comments...' : 'Explain why this action is being taken...'}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={submitAction}
                disabled={actionLoading !== null}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : action === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedRequest(null);
                  setComments('');
                }}
                className="btn-secondary"
                disabled={actionLoading !== null}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
