export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    walletBalance: string;
    isPremium: boolean;
    location?: string;
    _count?: {
        bookings: number;
    };
}

export interface Booking {
    id: string;
    serviceId: string;
    serviceName: string;
    date: string;
    timeSlot: string;
    locationType: string;
    locationAddress: string;
    instructions?: string;
    status: string;
    price: string;
    professionalId?: string;
    professionalName?: string;
    estimatedTime?: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
        phone?: string;
    };
}

export interface Professional {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    specialty: string;
    rating: string;
    isAvailable: boolean;
    createdAt: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalBookings: number;
    totalProfessionals: number;
    upcomingBookings: number;
    completedBookings: number;
    totalRevenue: string;
    recentBookings: Booking[];
    bookingsByCategory: Array<{
        serviceName: string;
        _count: {
            serviceName: number;
        };
    }>;
}
