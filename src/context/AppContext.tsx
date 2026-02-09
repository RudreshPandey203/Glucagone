import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem } from '../types';
import { useAuth } from './AuthContext';
import { addFoodLog, getFoodLogs, getUserTargets, saveUserTargets } from '../services/FoodLogService';

interface UserTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface AppState {
    targets: UserTargets;
    updateTargets: (newTargets: UserTargets) => Promise<void>;
    foodItems: FoodItem[];
    addFoodItem: (item: FoodItem) => Promise<void>;
    isLoading: boolean;
    refreshData: () => Promise<void>;
}

const defaultTargets: UserTargets = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userClient, isSetupComplete } = useAuth();
    const [targets, setTargets] = useState<UserTargets>(defaultTargets);
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isSetupComplete && userClient) {
            refreshData();
        } else {
            // Fallback to local or clear data
            setFoodItems([]);
        }
    }, [isSetupComplete, userClient]);

    const refreshData = async () => {
        if (!userClient) return;
        setIsLoading(true);
        try {
            const logs = await getFoodLogs(userClient);
            if (logs) setFoodItems(logs);

            const savedTargets = await getUserTargets(userClient);
            if (savedTargets) {
                // ensure valid numbers
                setTargets({
                    calories: Number(savedTargets.calories) || defaultTargets.calories,
                    protein: Number(savedTargets.protein) || defaultTargets.protein,
                    carbs: Number(savedTargets.carbs) || defaultTargets.carbs,
                    fat: Number(savedTargets.fat) || defaultTargets.fat,
                });
            }
        } catch (e) {
            console.error("Failed to load data from Supabase", e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateTargets = async (newTargets: UserTargets) => {
        setTargets(newTargets); // Optimistic update
        if (userClient) {
            await saveUserTargets(userClient, newTargets);
        }
        await AsyncStorage.setItem('user_targets', JSON.stringify(newTargets));
    };

    const addFoodItem = async (item: FoodItem) => {
        const newItems = [item, ...foodItems];
        setFoodItems(newItems); // Optimistic

        if (userClient) {
            await addFoodLog(userClient, item);
        }

        await AsyncStorage.setItem('food_items', JSON.stringify(newItems));
    };

    return (
        <AppContext.Provider value={{ targets, updateTargets, foodItems, addFoodItem, isLoading, refreshData }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
