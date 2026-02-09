import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useApp } from '../context/AppContext';

export const SettingsScreen = () => {
    const { targets, updateTargets } = useApp();
    const theme = useTheme();

    const [calories, setCalories] = useState(targets.calories.toString());
    const [protein, setProtein] = useState(targets.protein.toString());
    const [carbs, setCarbs] = useState(targets.carbs.toString());
    const [fat, setFat] = useState(targets.fat.toString());

    const handleSave = async () => {
        await updateTargets({
            calories: parseInt(calories) || 0,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fat: parseInt(fat) || 0,
        });
        alert('Settings saved!');
    };

    return (
        <ScrollView style={styles.container}>
            <Text variant="titleLarge" style={styles.header}>Daily Targets</Text>

            <TextInput
                label="Daily Calories"
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="Protein (g)"
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="Carbs (g)"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="Fat (g)"
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
            />

            <Button mode="contained" onPress={handleSave} style={styles.button}>
                Save Targets
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 20,
    },
});
