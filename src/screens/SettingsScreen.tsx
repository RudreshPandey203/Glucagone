import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Text, Divider, HelperText } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { TABLE_WEIGHT_LOGS } from '../services/FoodLogService';

export const SettingsScreen = () => {
    const { targets, updateTargets } = useApp();
    const { userClient } = useAuth();

    // Profile State
    const [calories, setCalories] = useState(targets.calories.toString());
    const [protein, setProtein] = useState(targets.protein.toString());
    const [carbs, setCarbs] = useState(targets.carbs.toString());
    const [fat, setFat] = useState(targets.fat.toString());

    // API Keys State
    const [geminiKey, setGeminiKey] = useState('');
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [showKeys, setShowKeys] = useState(false);

    useEffect(() => {
        setCalories(targets.calories.toString());
        setProtein(targets.protein.toString());
        setCarbs(targets.carbs.toString());
        setFat(targets.fat.toString());

        // Load keys partially hidden
        SecureStore.getItemAsync('gemini_api_key').then(k => setGeminiKey(k || ''));
        SecureStore.getItemAsync('supabase_url').then(k => setSupabaseUrl(k || ''));
        SecureStore.getItemAsync('supabase_key').then(k => setSupabaseKey(k || ''));
    }, [targets]);

    const handleSaveProfile = async () => {
        await updateTargets({
            calories: parseInt(calories) || 2000,
            protein: parseInt(protein) || 150,
            carbs: parseInt(carbs) || 200,
            fat: parseInt(fat) || 70,
        });
        Alert.alert('Success', 'Profile updated!');
    };

    const handleSaveKeys = async () => {
        Alert.alert(
            'Warning: Data Loss Risk',
            'Changing Supabase keys will disconnect you from your current database. Your local logs may be lost or inaccessible if you switch databases without backing them up. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Update Keys',
                    style: 'destructive',
                    onPress: async () => {
                        if (geminiKey) await SecureStore.setItemAsync('gemini_api_key', geminiKey);
                        if (supabaseUrl) await SecureStore.setItemAsync('supabase_url', supabaseUrl);
                        if (supabaseKey) await SecureStore.setItemAsync('supabase_key', supabaseKey);
                        Alert.alert('Restart Required', 'Please restart the app for changes to take effect.');
                    }
                }
            ]
        );
    };

    const checkDb = async () => {
        if (!userClient) return;
        const { error } = await userClient.from(TABLE_WEIGHT_LOGS).select('date').limit(1);
        if (error) {
            Alert.alert('Database Issue', `Could not access ${TABLE_WEIGHT_LOGS}. Error: ${error.message}\n\nHint: Did you run the SQL to create the table?`);
        } else {
            Alert.alert('Database OK', 'Connection to weight_logs table is working.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text variant="headlineMedium" style={styles.header}>Settings</Text>

            <Card style={styles.card}>
                <Card.Title title="Daily Targets" />
                <Card.Content>
                    <TextInput label="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" style={styles.input} mode="outlined" />
                    <View style={styles.row}>
                        <TextInput label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" style={[styles.input, styles.third]} mode="outlined" />
                        <TextInput label="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" style={[styles.input, styles.third]} mode="outlined" />
                        <TextInput label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="numeric" style={[styles.input, styles.third]} mode="outlined" />
                    </View>
                    <Button mode="contained" onPress={handleSaveProfile} style={styles.button}>Save Targets</Button>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="API Configuration" />
                <Card.Content>
                    <HelperText type="error">
                        Warning: Changing these keys connects you to a different database.
                    </HelperText>

                    {!showKeys ? (
                        <Button mode="outlined" onPress={() => setShowKeys(true)}>Show & Edit Keys</Button>
                    ) : (
                        <>
                            <TextInput label="Gemini API Key" value={geminiKey} onChangeText={setGeminiKey} secureTextEntry style={styles.input} mode="outlined" />
                            <TextInput label="Supabase URL" value={supabaseUrl} onChangeText={setSupabaseUrl} style={styles.input} mode="outlined" />
                            <TextInput label="Supabase Anon Key" value={supabaseKey} onChangeText={setSupabaseKey} secureTextEntry style={styles.input} mode="outlined" />
                            <Button mode="contained" onPress={handleSaveKeys} style={styles.button} buttonColor="red">Update Keys</Button>
                        </>
                    )}
                </Card.Content>
            </Card>

            <Button mode="text" onPress={checkDb} style={{ marginTop: 20 }}>Test Warning / DB Connection</Button>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        marginBottom: 20,
        fontWeight: 'bold',
    },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    third: {
        width: '31%',
    },
});
