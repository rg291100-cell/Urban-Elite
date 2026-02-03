import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
};

export const adminAPI = {
    getDashboardStats: () => api.get('/admin/dashboard'),

    // Users
    getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get('/admin/users', { params }),
    getUserDetails: (id: string) => api.get(`/admin/users/${id}`),
    updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),

    // Bookings
    getBookings: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
        api.get('/admin/bookings', { params }),
    updateBooking: (id: string, data: any) => api.put(`/admin/bookings/${id}`, data),

    // Professionals
    getProfessionals: () => api.get('/admin/professionals'),
    createProfessional: (data: any) => api.post('/admin/professionals', data),
    updateProfessional: (id: string, data: any) => api.put(`/admin/professionals/${id}`, data),
    deleteProfessional: (id: string) => api.delete(`/admin/professionals/${id}`),

    // Services
    getServiceCategories: () => api.get('/admin/services/categories'),
    createServiceCategory: (data: any) => api.post('/admin/services/categories', data),
    updateServiceCategory: (id: string, data: any) => api.put(`/admin/services/categories/${id}`, data),
    deleteServiceCategory: (id: string) => api.delete(`/admin/services/categories/${id}`),

    // Service Items
    getServiceItems: (categoryId: string) => api.get(`/admin/services/categories/${categoryId}/items`),
    createServiceItem: (categoryId: string, data: any) => api.post(`/admin/services/categories/${categoryId}/items`, data),
    updateServiceItem: (id: string, data: any) => api.put(`/admin/services/items/${id}`, data),
    deleteServiceItem: (id: string) => api.delete(`/admin/services/items/${id}`),

    // Vendors
    getPendingVendors: () => api.get('/admin/vendors/pending'),
    getAllVendors: (params?: { status?: string }) => api.get('/admin/vendors', { params }),
    approveVendor: (id: string) => api.put(`/admin/vendors/${id}/approve`),
    rejectVendor: (id: string) => api.put(`/admin/vendors/${id}/reject`),

    // Payments
    getPayments: () => api.get('/admin/payments'),
};

export default api;
