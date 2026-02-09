import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator, useTheme, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { analyzeFood } from '../services/GeminiService';
import { useAuth } from '../context/AuthContext';
import { updateFoodLog, deleteFoodLog } from '../services/FoodLogService';
import { FoodItem } from '../types';

export const AddFoodScreen = ({ navigation, route }: any) => {
    const { addFoodItem, refreshData } = useApp();
    const { userClient } = useAuth();
    const theme = useTheme();

    // Params for Edit Mode
    const existingItem: FoodItem | undefined = route.params?.item;
    const initialDate = route.params?.date ? new Date(route.params.date) : new Date();

    // State
    const [date, setDate] = useState(initialDate);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [foodName, setFoodName] = useState(existingItem?.name || '');
    const [calories, setCalories] = useState(existingItem?.calories?.toString() || '');
    const [protein, setProtein] = useState(existingItem?.macros?.protein.toString() || '');
    const [carbs, setCarbs] = useState(existingItem?.macros?.carbs.toString() || '');
    const [fat, setFat] = useState(existingItem?.macros?.fat.toString() || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!foodName.trim()) return;
        setLoading(true);
        setError('');
        try {
            const result = await analyzeFood(foodName);

            // Only update fields that are empty or zero (represented as '0' or '')
            // Preserve user entered values
            if (!calories || calories === '0') setCalories(result.calories?.toString() || '0');
            if (!protein || protein === '0') setProtein(result.macros?.protein.toString() || '0');
            if (!carbs || carbs === '0') setCarbs(result.macros?.carbs.toString() || '0');
            if (!fat || fat === '0') setFat(result.macros?.fat.toString() || '0');

        } catch (err) {
            setError('Analysis failed. You can enter details manually.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!foodName || !calories) {
            setError("Name and Calories are required.");
            return;
        }

        setLoading(true);
        try {
            const itemData: FoodItem = {
                id: existingItem?.id || Date.now().toString(),
                name: foodName,
                timestamp: date.getTime(),
                calories: parseInt(calories) || 0,
                macros: {
                    protein: parseInt(protein) || 0,
                    carbs: parseInt(carbs) || 0,
                    fat: parseInt(fat) || 0
                },
                verdict: existingItem?.verdict || "Manual Entry",
                micros: existingItem?.micros || {}
            };

            if (existingItem && userClient) {
                // Update
                await updateFoodLog(userClient, existingItem.id, {
                    name: itemData.name,
                    timestamp: itemData.timestamp,
                    calories: itemData.calories,
                    macros: itemData.macros
                });
            } else {
                // Create
                await addFoodItem(itemData);
            }

            // Refresh global analytics if needed
            if (userClient) await refreshData();

            navigation.goBack();
        } catch (e) {
            setError("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingItem || !userClient) return;
        setLoading(true);
        await deleteFoodLog(userClient, existingItem.id);
        await refreshData();
        navigation.goBack();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.dateRow}>
                <Text variant="bodyLarge">Date: {date.toLocaleDateString()}</Text>
                <Button mode="text" onPress={() => setShowDatePicker(true)}>Change</Button>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            <TextInput
                label="Food Name"
                value={foodName}
                onChangeText={setFoodName}
                mode="outlined"
                right={<TextInput.Icon icon="magic-staff" onPress={handleAnalyze} forceTextInputFocus={false} />}
                style={styles.input}
            />
            <HelperText type="info">Tap the wand to analyze with AI</HelperText>

            <View style={styles.row}>
                <TextInput
                    label="Calories"
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.half]}
                />
            </View>

            <View style={styles.row}>
                <TextInput
                    label="Protein (g)"
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.third]}
                />
                <TextInput
                    label="Carbs (g)"
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.third]}
                />
                <TextInput
                    label="Fat (g)"
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.third]}
                />
            </View>

            {error ? <HelperText type="error">{error}</HelperText> : null}
            {loading && <ActivityIndicator style={{ marginBottom: 10 }} />}

            <Button
                mode="contained"
                onPress={handleSave}
                disabled={loading}
                style={styles.button}
            >
                {existingItem ? "Update Entry" : "Save Entry"}
            </Button>

            {existingItem && (
                <Button
                    mode="outlined"
                    textColor={theme.colors.error}
                    onPress={handleDelete}
                    style={styles.deleteButton}
                >
                    Delete Entry
                </Button>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    half: {
        width: '48%',
    },
    third: {
        width: '31%',
    },
    button: {
        marginTop: 16,
    },
    deleteButton: {
        marginTop: 12,
        borderColor: '#b00020'
    }
});
