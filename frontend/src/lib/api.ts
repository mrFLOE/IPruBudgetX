import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  unlock: (userId: string) => api.post('/auth/unlock', { user_id: userId }),
};

export const usersAPI = {
  getAll: () => api.get('/admin/users'),
  create: (data: any) => api.post('/admin/users', data),
  update: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  lock: (id: string) => api.patch(`/admin/users/${id}/lock`),
  unlock: (id: string) => api.patch(`/admin/users/${id}/unlock`),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
};

export const requestsAPI = {
  getAll: () => api.get('/requests'),
  getById: (id: string) => api.get(`/requests/${id}`),
  create: (data: any) => api.post('/requests', data),
  update: (id: string, data: any) => api.patch(`/requests/${id}`, data),
  submit: (id: string) => api.post(`/requests/${id}/submit`),
  delete: (id: string) => api.delete(`/requests/${id}`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/requests/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getSuggestions: (id: string) => api.get(`/requests/${id}/suggestions`),
};

export const approvalsAPI = {
  getPending: () => api.get('/approvals/pending'),
  getTimeline: (requestId: string) => api.get(`/timeline/${requestId}`),
  approve: (requestId: string, comments?: string) =>
    api.post(`/requests/${requestId}/approve`, { comments }),
  reject: (requestId: string, comments: string) =>
    api.post(`/requests/${requestId}/reject`, { comments }),
  rework: (requestId: string, comments: string) =>
    api.post(`/requests/${requestId}/rework`, { comments }),
};

export const adminAPI = {
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (name: string) => api.post('/admin/departments', { name }),
  updateDepartment: (id: string, name: string) =>
    api.patch(`/admin/departments/${id}`, { name }),
  deleteDepartment: (id: string) => api.delete(`/admin/departments/${id}`),
  getHierarchy: () => api.get('/admin/hierarchy'),
  updateHierarchy: (hierarchy: string[]) =>
    api.patch('/admin/hierarchy', { hierarchy }),
  getAuditLogs: (limit?: number) =>
    api.get('/admin/audit-logs', { params: { limit } }),
  getStats: () => api.get('/admin/stats'),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
