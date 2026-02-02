import { supabase } from '../lib/supabase';

export const authService = {
    // Get JWT token from Supabase session
    async getToken(): Promise<string | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session?.access_token || null;
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    },

    // Get user data from Supabase
    async getUser(): Promise<any | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('Error retrieving user:', error);
            return null;
        }
    },

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    },

    // Logout
    async clearAuth(): Promise<void> {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error clearing auth data:', error);
            throw error;
        }
    },
};

