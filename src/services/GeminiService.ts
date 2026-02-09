import { GoogleGenAI } from "@google/genai";
import { FoodItem } from '../types';
import * as SecureStore from 'expo-secure-store';

// Helper function for mock data
const getMockData = (foodName: string, verdict: string): FoodItem => {
    return {
        id: Date.now().toString(),
        name: foodName,
        timestamp: Date.now(),
        calories: 100,
        macros: { protein: 5, carbs: 10, fat: 2 },
        micros: { "Vitamin C": 10 },
        verdict: `Mock verdict: ${verdict}`
    };
};

export const analyzeFood = async (foodName: string): Promise<FoodItem> => {
    let apiKey = await SecureStore.getItemAsync('gemini_api_key');

    // Fallback for dev/demo if not found in SecureStore
    if (!apiKey) {
        apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    }

    // Safety check for API Key
    if (!apiKey) {
        console.warn("Gemini API Key is missing. Returning mock data.");
        return getMockData(foodName, "No API Key found. Please setup in Settings.");
    }

    try {
        const client = new GoogleGenAI({ apiKey });

        const prompt = `
        Analyze the following food item: "${foodName}".
        Return a JSON object with this exact structure:
        {
            "calories": number,
            "macros": { "protein": number, "carbs": number, "fat": number },
            "micros": { "item_name": number },
            "verdict": "string",
            "name": "string"
        }
        Strictly return valid JSON. Do not include markdown code blocks.
        `;

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const responseText = response.text || "";
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        if (!jsonStr) {
            throw new Error("Gemini returned an empty response.");
        }

        const data = JSON.parse(jsonStr);

        return {
            id: Date.now().toString(),
            name: data.name || foodName,
            timestamp: Date.now(),
            calories: Number(data.calories || 0),
            macros: {
                protein: Number(data.macros?.protein || 0),
                carbs: Number(data.macros?.carbs || 0),
                fat: Number(data.macros?.fat || 0),
            },
            verdict: data.verdict || "Analysis complete.",
            micros: data.micros || {}
        };

    } catch (error) {
        console.error("Error analyzing food with Gemini:", error);
        return getMockData(foodName, "Analysis failed. Using mock data.");
    }
};