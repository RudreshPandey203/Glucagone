import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { FoodItem } from '../types';

interface FoodListProps {
    items: FoodItem[];
    onRemoveItem: (id: string) => void;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

export const FoodList = ({ items, onRemoveItem, ListHeaderComponent, contentContainerStyle }: FoodListProps) => {
    const theme = useTheme();

    const renderItem = ({ item }: { item: FoodItem }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{item.name}</Text>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        {item.calories} cal
                    </Text>
                    <Text variant="bodySmall">
                        P:{item.macros?.protein?.toFixed(2) || '0.00'} C:{item.macros?.carbs?.toFixed(2) || '0.00'} F:{item.macros?.fat?.toFixed(2) || '0.00'}
                    </Text>
                </View>
                <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => onRemoveItem(item.id)}
                    style={{ margin: 0 }}
                />
            </Card.Content>
        </Card>
    );

    return (
        <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={contentContainerStyle}
            ListEmptyComponent={<Text style={styles.empty}>No meals logged today.</Text>}
        />
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        marginHorizontal: 16,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    verdict: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#555',
        marginTop: 2
    }
});
