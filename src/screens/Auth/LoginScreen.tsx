import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        const { error: loginError } = await login(email, password);
        if (loginError) {
            setError(loginError.message);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineLarge" style={styles.title}>Welcome Back</Text>

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

            <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                style={styles.button}
            >
                Login
            </Button>

            <Button
                mode="text"
                onPress={() => navigation.navigate('SignUp')}
                style={styles.textButton}
            >
                Create an account
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
