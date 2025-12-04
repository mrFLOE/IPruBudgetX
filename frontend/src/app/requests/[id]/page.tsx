'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { requestsAPI, approvalsAPI } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequestDetails();
  }, [requestId]);

  const loadRequestDetails = async () => {
    try {
      const [requestRes, timelineRes] = await Promise.all([
        requestsAPI.getById(requestId),
        approvalsAPI.getTimeline(requestId),
      ]);
      setRequest(requestRes.data);
      setTimeline(timelineRes.data.timeline || []);
    } catch (error) {
      console.error('Error loading request details:', error);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-gray-500">Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{request.category}</h1>
            <div className="flex items-center gap-3">
              <span className={`badge ${getStatusBadge(request.status)}`}>
                {request.status}
              </span>
              <span className="badge badge-info">{request.type}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">
              ${request.amount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600">Requester</p>
            <p className="font-semibold">{request.requester_name}</p>
            <p className="text-sm text-gray-500">{request.requester_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="font-semibold">{request.department_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-semibold">{new Date(request.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-semibold">{new Date(request.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="font-bold text-gray-900 mb-2">Justification</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{request.justification}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Approval Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-gray-500">No approval actions yet</p>
        ) : (
          <div className="space-y-4">
            {timeline.map((record, index) => (
              <div key={record.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.decision === 'APPROVED'
                      ? 'bg-green-100 text-green-600'
                      : record.decision === 'REJECTED'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {record.decision === 'APPROVED' ? '✓' : record.decision === 'REJECTED' ? '✗' : '↻'}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-300 ml-5 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{record.approver_name}</p>
                      <p className="text-sm text-gray-600">{record.role}</p>
                    </div>
                    <span className={`badge ${
                      record.decision === 'APPROVED'
                        ? 'badge-success'
                        : record.decision === 'REJECTED'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}>
                      {record.decision}
                    </span>
                  </div>
                  {record.comments && (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{record.comments}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(record.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
