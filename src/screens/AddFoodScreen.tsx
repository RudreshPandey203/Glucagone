import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator, useTheme } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { analyzeFood } from '../services/GeminiService';
import { syncToSheets } from '../services/GoogleSheetsService';

export const AddFoodScreen = ({ navigation }: any) => {
    const { addFoodItem } = useApp();
    const theme = useTheme();

    const [foodName, setFoodName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAdd = async () => {
        if (!foodName.trim()) return;

        setLoading(true);
        setError('');

        try {
            const newItem = await analyzeFood(foodName);
            await addFoodItem(newItem);

            // Sync to sheets in background
            syncToSheets(newItem).catch(console.error);

            navigation.goBack();
        } catch (err) {
            setError('Failed to analyze food. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="What did you eat?"
                value={foodName}
                onChangeText={setFoodName}
                mode="outlined"
                style={styles.input}
                right={<TextInput.Icon icon="food" />}
            />

            {error ? <HelperText type="error">{error}</HelperText> : null}

            <Button
                mode="contained"
                onPress={handleAdd}
                loading={loading}
                disabled={loading || !foodName.trim()}
                style={styles.button}
            >
                Analyze & Add
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
});
