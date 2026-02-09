import { GoogleGenAI } from "@google/genai";
import { FoodItem } from '../types';

// Initialize the client
// The new SDK uses this configuration object format
const ai = new GoogleGenAI({
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY
});

export const analyzeFood = async (foodName: string): Promise<FoodItem> => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("Gemini API Key is missing. Returning mock data.");
        return {
            id: Date.now().toString(),
            name: foodName,
            timestamp: Date.now(),
            calories: 100,
            macros: { protein: 5, carbs: 10, fat: 2 },
            micros: { "Vitamin C": 10 },
            verdict: "Mock verdict: Key missing."
        };
    }

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
    Strictly return valid JSON.
    `;

    try {
        // Using the exact structure from your documentation snippet
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Use stable 'gemini-2.0-flash' or your 'gemini-3-flash-preview'
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        // FIX: Access .text as a property and handle the "undefined" case
        const jsonStr = response.text;

        if (!jsonStr) {
            throw new Error("Gemini returned an empty response (check safety settings).");
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
        throw error;
    }
};