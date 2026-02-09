import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { FoodItem } from '../types';

interface FoodListProps {
    items: FoodItem[];
    onRemoveItem: (id: string) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ items, onRemoveItem }) => {
    return (
        <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.calories && (
                            <Text style={styles.itemDetails}>
                                {item.calories} kcal | P: {item.macros?.protein}g | C: {item.macros?.carbs}g | F: {item.macros?.fat}g
                            </Text>
                        )}
                        {item.verdict && (
                            <Text style={styles.verdict}>Verdict: {item.verdict}</Text>
                        )}
                    </View>
                    <Button title="Remove" onPress={() => onRemoveItem(item.id)} color="red" />
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
    },
    verdict: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#555',
        marginTop: 2
    }
});
