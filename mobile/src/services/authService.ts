import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@urban_elite_token';
const USER_KEY = '@urban_elite_user';

export const authService = {
    // Get JWT token from AsyncStorage (custom auth)
    async getToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            return token;
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    },

    // Store token after login
    async setToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    },

    // Get user data from AsyncStorage
    async getUser(): Promise<any | null> {
        try {
            const userJson = await AsyncStorage.getItem(USER_KEY);
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            console.error('Error retrieving user:', error);
            return null;
        }
    },

    // Store user data after login
    async setUser(user: any): Promise<void> {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error storing user:', error);
            throw error;
        }
    },

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    },

    // Get user role
    async getUserRole(): Promise<string | null> {
        const user = await this.getUser();
        return user?.role || null;
    },

    // Logout
    async clearAuth(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } catch (error) {
            console.error('Error clearing auth data:', error);
            throw error;
        }
    },
};

