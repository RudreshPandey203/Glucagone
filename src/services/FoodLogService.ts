import { SupabaseClient } from '@supabase/supabase-js';
import { FoodItem } from '../types';

export const TABLE_FOOD_LOGS = 'food_logs';
export const TABLE_USER_TARGETS = 'user_targets';
export const TABLE_WEIGHT_LOGS = 'weight_logs';

export const upsertWeightLog = async (client: SupabaseClient, date: string, weight: number) => {
    try {
        const { error } = await client
            .from(TABLE_WEIGHT_LOGS)
            .upsert({ date, weight });

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error saving weight log:", e);
        return false;
    }
};

export const getWeightLog = async (client: SupabaseClient, date: string) => {
    try {
        const { data, error } = await client
            .from(TABLE_WEIGHT_LOGS)
            .select('*')
            .eq('date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore not found
        return data ? data.weight : null;
    } catch (e) {
        console.error("Error fetching weight log:", e);
        return null;
    }
};

export const addFoodLog = async (client: SupabaseClient, item: FoodItem) => {
    try {
        const { error } = await client
            .from(TABLE_FOOD_LOGS)
            .insert(item);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error adding food log:", e);
        return false;
    }
};

export const getFoodLogs = async (client: SupabaseClient, date?: string) => {
    try {
        // Assuming timestamp is stored as big int or ISO string
        // We might need to adjust based on how date filtering works in Supabase
        // Ideally, we store a 'date' column for easier querying

        // For now, let's just fetch all and filter in memory or sort by timestamp descending
        const { data, error } = await client
            .from(TABLE_FOOD_LOGS)
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data as FoodItem[];
    } catch (e) {
        console.error("Error fetching food logs:", e);
        return [];
    }
};

export const saveUserTargets = async (client: SupabaseClient, targets: any) => {
    try {
        // Upsert based on a single row logic or user_id if we had auth in user db
        // Since it's a personal DB, we can just have one row with id=1
        const { error } = await client
            .from(TABLE_USER_TARGETS)
            .upsert({ id: 1, ...targets });

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error saving targets:", e);
        return false;
    }
};

export const getUserTargets = async (client: SupabaseClient) => {
    try {
        const { data, error } = await client
            .from(TABLE_USER_TARGETS)
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error("Error fetching targets:", e);
        return null;
    }
};

export const updateFoodLog = async (client: SupabaseClient, id: string, updates: Partial<FoodItem>) => {
    try {
        const { error } = await client
            .from(TABLE_FOOD_LOGS)
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating food log:", e);
        return false;
    }
};

export const deleteFoodLog = async (client: SupabaseClient, id: string) => {
    try {
        const { error } = await client
            .from(TABLE_FOOD_LOGS)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error deleting food log:", e);
        return false;
    }
};

export const getFoodLogsByRange = async (client: SupabaseClient, startDate: number, endDate: number) => {
    try {
        const { data, error } = await client
            .from(TABLE_FOOD_LOGS)
            .select('*')
            .gte('timestamp', startDate)
            .lte('timestamp', endDate)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data as FoodItem[];
    } catch (e) {
        console.error("Error fetching range logs:", e);
        return [];
    }
};
