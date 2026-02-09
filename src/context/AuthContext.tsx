import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { adminSupabase, createUserClient } from '../services/SupabaseClients';
import * as SecureStore from 'expo-secure-store';

interface UserDBConfig {
    url: string;
    anonKey: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userClient: any | null; // The client for user's own DB
    isLoading: boolean;
    isSetupComplete: boolean;
    login: (email: string, pass: string) => Promise<{ error: any }>;
    signUp: (email: string, pass: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
    setupUserDB: (config: UserDBConfig, geminiKey: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [userClient, setUserClient] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    useEffect(() => {
        // Check active session
        adminSupabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                loadUserConfig(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = adminSupabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                loadUserConfig(session.user.id);
            } else {
                setUserClient(null);
                setIsSetupComplete(false);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserConfig = async (userId: string) => {
        try {
            // Fetch encrypted/stored user config from Admin DB
            const { data, error } = await adminSupabase
                .from('user_configs')
                .select('db_url, db_anon_key')
                .eq('user_id', userId)
                .single();

            if (data && data.db_url && data.db_anon_key) {
                // Init user client
                const client = createUserClient(data.db_url, data.db_anon_key);
                setUserClient(client);
                setIsSetupComplete(true);
            } else {
                // User logged in but hasn't setup their DB
                setIsSetupComplete(false);
            }
        } catch (e) {
            console.error("Error loading user config:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
        return await adminSupabase.auth.signInWithPassword({ email, password: pass });
    };

    const signUp = async (email: string, pass: string) => {
        return await adminSupabase.auth.signUp({ email, password: pass });
    };

    const logout = async () => {
        await adminSupabase.auth.signOut();
        setUserClient(null);
        setIsSetupComplete(false);
    };

    const setupUserDB = async (config: UserDBConfig, geminiKey: string) => {
        if (!session?.user) return false;

        // 1. Save Gemini Key locally
        await SecureStore.setItemAsync('gemini_api_key', geminiKey);

        // 2. Save DB Config to Admin DB
        // Note: In a real prod app, you'd encrypt these before sending or use RLS to ensure only user can read
        const { error } = await adminSupabase
            .from('user_configs')
            .upsert({
                user_id: session.user.id,
                db_url: config.url,
                db_anon_key: config.anonKey,
                updated_at: new Date(),
            });

        if (error) {
            console.error("Setup failed:", error);
            return false;
        }

        // 3. Init client immediately
        const client = createUserClient(config.url, config.anonKey);
        setUserClient(client);
        setIsSetupComplete(true);
        return true;
    };

    return (
        <AuthContext.Provider value={{
            session,
            user: session?.user ?? null,
            userClient,
            isLoading,
            isSetupComplete,
            login,
            signUp,
            logout,
            setupUserDB
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
