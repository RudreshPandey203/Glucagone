import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { FoodItem } from '../types';

// TODO: Replace with user's Firebase config
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Initialize Firebase
// valid config check
const isConfigured = firebaseConfig.projectId !== "PROJECT_ID";

let app;
let db: any;

if (isConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} else {
    console.warn("Firebase is not configured. Data will not be synced.");
}

export const saveFoodItemToFirebase = async (item: FoodItem) => {
    if (!db) return;
    try {
        await addDoc(collection(db, "food_logs"), item);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const getDailyLogsFromFirebase = async (date: string) => {
    if (!db) return [];
    // querying logic to be added
    return [];
};
