import { useMemo } from 'react';
import { FoodItem } from '../types';

export const useFoodAnalytics = (items: FoodItem[]) => {
    const analytics = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneWeekAgo = today - 7 * 24 * 60 * 60 * 1000;
        const oneMonthAgo = today - 30 * 24 * 60 * 60 * 1000;

        const filterByDate = (startDate: number) => items.filter(item => item.timestamp >= startDate);

        const calculateTotals = (filteredItems: FoodItem[]) => {
            return filteredItems.reduce((acc, item) => ({
                calories: acc.calories + (item.calories || 0),
                protein: acc.protein + (item.macros?.protein || 0),
                carbs: acc.carbs + (item.macros?.carbs || 0),
                fat: acc.fat + (item.macros?.fat || 0),
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        };

        const dailyItems = filterByDate(today);
        const weeklyItems = filterByDate(oneWeekAgo);
        const monthlyItems = filterByDate(oneMonthAgo);

        return {
            daily: calculateTotals(dailyItems),
            weekly: calculateTotals(weeklyItems),
            monthly: calculateTotals(monthlyItems),
            history: { daily: dailyItems, weekly: weeklyItems, monthly: monthlyItems }
        };
    }, [items]);

    return analytics;
};
