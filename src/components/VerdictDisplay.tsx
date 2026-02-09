import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Totals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface VerdictDisplayProps {
    period: 'Daily' | 'Weekly' | 'Monthly';
    totals: Totals;
}

export const VerdictDisplay: React.FC<VerdictDisplayProps> = ({ period, totals }) => {
    const getVerdict = () => {
        // Simple logic for demonstration. Ideally this would utilize Gemini or more complex heuristics.
        if (totals.calories === 0) return "No data yet.";

        // Example thresholds (very generic)
        const normalizedCalories = period === 'Weekly' ? totals.calories / 7 : period === 'Monthly' ? totals.calories / 30 : totals.calories;

        if (normalizedCalories > 2500) return "High calorie intake. Consider reducing portion sizes.";
        if (normalizedCalories < 1200) return "Low calorie intake. Ensure you're eating enough.";

        return "Balanced calorie intake.";
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{period} Verdict</Text>
            <Text style={styles.verdictText}>{getVerdict()}</Text>
            <View style={styles.stats}>
                <Text>Cals: {totals.calories}</Text>
                <Text>P: {totals.protein}g</Text>
                <Text>C: {totals.carbs}g</Text>
                <Text>F: {totals.fat}g</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
        width: '100%',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    verdictText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 5,
        color: '#333',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
