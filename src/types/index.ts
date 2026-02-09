export interface FoodItem {
    id: string;
    name: string;
    timestamp: number;
    calories?: number;
    macros?: {
        protein: number;
        carbs: number;
        fat: number;
    };
    micros?: Record<string, number>;
    verdict?: string;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    items: FoodItem[];
    totalCalories: number;
    totalMacros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}
