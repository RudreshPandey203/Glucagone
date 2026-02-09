import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';

interface FoodInputProps {
    onAddFood: (foodName: string) => void;
    isLoading?: boolean;
}

export const FoodInput: React.FC<FoodInputProps> = ({ onAddFood, isLoading }) => {
    const [foodName, setFoodName] = useState('');

    const handleAdd = () => {
        if (foodName.trim()) {
            onAddFood(foodName.trim());
            setFoodName('');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="What did you eat?"
                value={foodName}
                onChangeText={setFoodName}
                onSubmitEditing={handleAdd}
            />
            {isLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
            ) : (
                <Button title="Add" onPress={handleAdd} disabled={!foodName.trim()} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
});
