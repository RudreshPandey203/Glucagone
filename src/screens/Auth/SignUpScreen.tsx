import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export const SignUpScreen = ({ navigation }: any) => {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSignUp = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        const { error: signUpError } = await signUp(email, password);

        if (signUpError) {
            setError(signUpError.message);
        } else {
            setMessage("Account created! Please verify your email if required.");
            // Optional: Navigate to Login after a delay or immediately
            // navigation.navigate('Login');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineLarge" style={styles.title}>Create Account</Text>

            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
            />

            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
            />

            {error ? <HelperText type="error">{error}</HelperText> : null}
            {message ? <HelperText type="info" style={{ color: 'green' }}>{message}</HelperText> : null}

            <Button
                mode="contained"
                onPress={handleSignUp}
                loading={loading}
                style={styles.button}
            >
                Sign Up
            </Button>

            <Button
                mode="text"
                onPress={() => navigation.goBack()}
                style={styles.textButton}
            >
                Already have an account? Login
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    },
    textButton: {
        marginTop: 20,
    }
});
