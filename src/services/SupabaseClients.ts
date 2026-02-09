import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Admin Client (Authentication & Key Backup)
// These should be in your .env file
const ADMIN_URL = process.env.EXPO_PUBLIC_ADMIN_SUPABASE_URL || '';
const ADMIN_KEY = process.env.EXPO_PUBLIC_ADMIN_SUPABASE_ANON_KEY || '';

if (!ADMIN_URL || !ADMIN_KEY) {
    console.warn("Admin Supabase keys are missing! Authentication will fail.");
}

// Custom storage adapter for React Native
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
    },
};

export const adminSupabase = createClient(ADMIN_URL, ADMIN_KEY, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Factory for User Client (Data Storage)
export const createUserClient = (url: string, key: string): SupabaseClient => {
    return createClient(url, key, {
        auth: {
            // User's DB likely doesn't need auth persistence if we manage connection string manually
            // or we can reuse the same adapter if they have auth enabled on their end
            persistSession: false,
            autoRefreshToken: false
        },
        global: {
            // Optional: Add custom headers if needed
        }
    });
};
