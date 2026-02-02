import axios from 'axios';
import { Platform } from 'react-native';
import { authService } from './authService';

import { API_URL } from '@env';

// Using 127.0.0.1 directly to avoid IPv6 resolution issues with ADB Reverse
const BASE_URL = API_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to all requests
api.interceptors.request.use(
    async (config) => {
        const token = await authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 unauthorized responses
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response.status,
                data: error.response.data,
            });
        } else if (error.request) {
            console.error(`API No Response: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.request);
        } else {
            console.error('API Setup Error:', error.message);
        }

        if (error.response?.status === 401) {
            // Clear auth data and redirect to login
            await authService.clearAuth();
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
    register: (data: { name: string; email: string; phone?: string; password: string }) =>
        api.post('/api/auth/register', data),
    getCurrentUser: () => api.get('/api/auth/me'),
};

export const homeAPI = {
    getHomeData: () => api.get('/api/home'),
    getServiceDetails: (type: string) => api.get(`/api/services/${type}`),
    getServiceDetail: (id: string) => api.get(`/api/service/${id}`),
};

export const userAPI = {
    getProfile: () => api.get('/api/user/profile'),
    updateProfile: (data: any) => api.put('/api/user/profile', data),

    getWallet: () => api.get('/api/user/wallet'),
    topupWallet: (amount: string) => api.post('/api/user/wallet/topup', { amount }),

    getBookings: () => api.get('/api/user/bookings'),

    getAddresses: () => api.get('/api/user/addresses'),
    addAddress: (data: any) => api.post('/api/user/addresses', data),
    deleteAddress: (id: string) => api.delete(`/api/user/addresses/${id}`),

    getPaymentMethods: () => api.get('/api/user/payment-methods'),
    addPaymentMethod: (data: any) => api.post('/api/user/payment-methods', data),
    deletePaymentMethod: (id: string) => api.delete(`/api/user/payment-methods/${id}`),

    getNotificationSettings: () => api.get('/api/user/notifications/settings'),
    updateNotificationSettings: (data: any) => api.put('/api/user/notifications/settings', data),
};

export const bookingAPI = {
    createBooking: (data: {
        serviceId: string;
        serviceName: string;
        date: string;
        timeSlot: string;
        location: { type: string; address: string };
        instructions: string;
        price: string;
    }) => api.post('/api/bookings', data),
    getBooking: (id: string) => api.get(`/api/bookings/${id}`),
    getBookingTracking: (id: string) => api.get(`/api/bookings/${id}/tracking`),
};

export default api;
