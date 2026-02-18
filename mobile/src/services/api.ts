import axios from 'axios';
import { Platform } from 'react-native';
import { authService } from './authService';

import { API_URL } from '@env';

// Use API_URL from .env for production, fallback to localhost for development
const BASE_URL = API_URL || 'http://10.0.2.2:3000';

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

        // If User Profile is not found (404), likely means token belongs to a user that doesn't exist in this DB (e.g. switching envs)
        if (error.response?.status === 404 && error.config?.url?.includes('/api/user/profile')) {
            console.log('User profile not found, clearing auth...');
            await authService.clearAuth();
            // Force reload/navigation to login might happen via state change listener or next app launch
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
    googleLogin: (idToken: string, role: string) => api.post('/api/auth/google-login', { idToken, role }),
    register: (data: any) => api.post('/api/auth/register', data),
    getCurrentUser: () => api.get('/api/auth/me'),
    forgotPassword: (email: string) => api.post('/api/auth/forgot-password', { email }),
    verifyOTP: (email: string, otp: string) => api.post('/api/auth/verify-otp', { email, otp }),
    resetPassword: (data: any) => api.post('/api/auth/reset-password', data),
};

export const homeAPI = {
    getHomeData: () => api.get('/api/home'),
    // Legacy (may be removed)
    getServiceDetails: (type: string) => api.get(`/api/home/services/${type}`),

    // New Hierarchy
    getSubCategories: (slug: string) => api.get(`/api/home/subcategories/${slug}`),
    getServiceListing: (slug: string) => api.get(`/api/home/listing/${slug}`),

    getServiceDetail: (id: string) => api.get(`/api/home/service/${id}`),
};

export const userAPI = {
    getProfile: () => api.get('/api/user/profile'),
    updateProfile: (data: any) => api.put('/api/user/profile', data),

    getBookings: () => api.get('/api/user/bookings'),

    getAddresses: () => api.get('/api/user/addresses'),
    addAddress: (data: any) => api.post('/api/user/addresses', data),
    deleteAddress: (id: string) => api.delete(`/api/user/addresses/${id}`),

    getPaymentMethods: () => api.get('/api/user/payment-methods'),
    addPaymentMethod: (data: any) => api.post('/api/user/payment-methods', data),
    deletePaymentMethod: (id: string) => api.delete(`/api/user/payment-methods/${id}`),

    getWallet: () => api.get('/api/user/wallet'),
    topupWallet: (amount: string, paymentMethodId?: string) =>
        api.post('/api/user/wallet/topup', { amount, paymentMethodId }),
    getWalletTransactions: () => api.get('/api/user/wallet/transactions'),

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
        paymentMode?: string;
        attachmentUrl?: string | null;
    }) => api.post('/api/bookings', data),
    getBooking: (id: string) => api.get(`/api/bookings/${id}`),
    getBookingTracking: (id: string) => api.get(`/api/bookings/${id}/tracking`),
    cancelBooking: (id: string) => api.post(`/api/bookings/${id}/cancel`, {}),
}

// Service Categories
export const serviceAPI = {
    getCategories: () => api.get('/api/home/services/categories'),
    getSubCategories: (categoryId: string) => api.get(`/api/home/subcategories/by-id/${categoryId}`),
    getServiceItems: (subCategoryId: string) => api.get(`/api/home/listing/by-id/${subCategoryId}`),
};

export const vendorAPI = {
    getDashboard: () => api.get('/api/vendor/dashboard'),
    getRevenue: () => api.get('/api/vendor/revenue'),
    getBookings: (status?: string) => api.get('/api/vendor/bookings', { params: { status } }),
    updateBookingStatus: (bookingId: string, status: string) =>
        api.put(`/api/vendor/bookings/${bookingId}/status`, { status }),
    getServices: () => api.get('/api/vendor/services'),
    updateServices: (services: any) => api.put('/api/vendor/services', { services }),
};

export const chatAPI = {
    getMessages: (bookingId: string) => api.get(`/api/chat/${bookingId}`),
    sendMessage: (bookingId: string, content: string) => api.post(`/api/chat/${bookingId}`, { content }),
};

export const offersAPI = {
    getOffers: () => api.get('/api/offers'),
    createOffer: (data: any) => api.post('/api/offers', data),
    getVendorOffers: () => api.get('/api/offers/vendor'),
};

export const paymentAPI = {
    createOrder: (data: any) => api.post('/api/payments/create-order', data),
    verifyPayment: (data: any) => api.post('/api/payments/verify-payment', data),
};

export default api;
