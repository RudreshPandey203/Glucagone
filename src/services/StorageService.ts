import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem } from '../types';

const STORAGE_KEY = 'food_tracker_data';

export const saveFoodItems = async (items: FoodItem[]) => {
    try {
        const jsonValue = JSON.stringify(items);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error("Error saving data", e);
    }
};

export const loadFoodItems = async (): Promise<FoodItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error loading data", e);
        return [];
    }
};
