import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem } from '../types';

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
    addFoodItem: (item: FoodItem) => void;
    isLoading: boolean;
}

const defaultTargets: UserTargets = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [targets, setTargets] = useState<UserTargets>(defaultTargets);
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const storedTargets = await AsyncStorage.getItem('user_targets');
            if (storedTargets) {
                setTargets(JSON.parse(storedTargets));
            }

            const storedFood = await AsyncStorage.getItem('food_items');
            if (storedFood) {
                setFoodItems(JSON.parse(storedFood));
            }
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateTargets = async (newTargets: UserTargets) => {
        setTargets(newTargets);
        await AsyncStorage.setItem('user_targets', JSON.stringify(newTargets));
    };

    const addFoodItem = async (item: FoodItem) => {
        const newItems = [item, ...foodItems];
        setFoodItems(newItems);
        await AsyncStorage.setItem('food_items', JSON.stringify(newItems));
        // Firebase sync will go here later
    };

    return (
        <AppContext.Provider value={{ targets, updateTargets, foodItems, addFoodItem, isLoading }}>
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
