import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, Text, Card } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export const SetupScreen = () => {
    const { setupUserDB } = useAuth();

    const [dbUrl, setDbUrl] = useState('');
    const [dbKey, setDbKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSetup = async () => {
        if (!dbUrl || !dbKey || !geminiKey) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError('');

        const success = await setupUserDB({ url: dbUrl, anonKey: dbKey }, geminiKey);

        if (!success) {
            setError("Setup failed. Please check your keys and try again.");
        }
        // If success, App.tsx will automatically switch to MainTabs via AuthContext state
        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Database Setup</Text>
            <Text style={styles.subtitle}>
                Connect your own Supabase database and Gemini API key to start tracking.
            </Text>

            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Supabase Configuration</Text>
                    <TextInput
                        label="Project URL"
                        value={dbUrl}
                        onChangeText={setDbUrl}
                        mode="outlined"
                        placeholder="https://xyz.supabase.co"
                        autoCapitalize="none"
                        style={styles.input}
                    />
                    <TextInput
                        label="Anon Key"
                        value={dbKey}
                        onChangeText={setDbKey}
                        mode="outlined"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                        autoCapitalize="none"
                        style={styles.input}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>AI Configuration</Text>
                    <TextInput
                        label="Gemini API Key"
                        value={geminiKey}
                        onChangeText={setGeminiKey}
                        mode="outlined"
                        secureTextEntry
                        placeholder="AIzaSy..."
                        style={styles.input}
                    />
                </Card.Content>
            </Card>

            {error ? <HelperText type="error">{error}</HelperText> : null}

            <Button
                mode="contained"
                onPress={handleSetup}
                loading={loading}
                style={styles.button}
            >
                Save & Continue
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    card: {
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 15,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    }
});
