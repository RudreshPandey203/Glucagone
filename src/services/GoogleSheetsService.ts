import axios from 'axios';
import { FoodItem } from '../types';

// Ideally, these would be user-configured or env vars
const SHEET_ID = process.env.EXPO_PUBLIC_SPREADSHEET_ID;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY; // Only works for reading public sheets or using a robust backend
// For write access to a user-provided sheet, we usually need OAuth or a Service Account.
// Since this is a prototype/mobile app, using a Google Apps Script Web App is the easiest "open link" way.

// Placeholder URL for a Google Apps Script Web App that the user would deploy.
// The user "provides open link" -> this could be that script URL.
const APPS_SCRIPT_URL = process.env.EXPO_PUBLIC_APPS_SCRIPT_URL;

export const syncToSheets = async (item: FoodItem) => {
    if (!APPS_SCRIPT_URL) {
        console.warn("Google Apps Script URL is missing. Skipping sync.");
        return;
    }

    try {
        await axios.post(APPS_SCRIPT_URL, {
            action: 'append',
            data: {
                date: new Date(item.timestamp).toISOString(),
                food: item.name,
                calories: item.calories,
                protein: item.macros?.protein,
                carbs: item.macros?.carbs,
                fat: item.macros?.fat,
                verdict: item.verdict
            }
        });
        console.log("Synced to sheets");
    } catch (error) {
        console.error("Failed to sync to sheets:", error);
        // Silent fail or retry logic
    }
};
