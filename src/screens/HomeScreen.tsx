import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, FAB, Card, ProgressBar, useTheme } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { FoodList } from '../components/FoodList';

export const HomeScreen = ({ navigation }: any) => {
    const { targets, foodItems } = useApp();
    const theme = useTheme();

    // Calculate daily totals (mock for now, should filter by date)
    const today = new Date().toDateString();
    const dailyItems = foodItems.filter(item => new Date(item.timestamp).toDateString() === today);

    const dailyTotals = dailyItems.reduce((acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.macros?.protein || 0),
        carbs: acc.carbs + (item.macros?.carbs || 0),
        fat: acc.fat + (item.macros?.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const getProgress = (current: number, target: number) => {
        if (target === 0) return 0;
        return Math.min(current / target, 1);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <Text variant="titleLarge">Today's Summary</Text>

                        <View style={styles.metricRow}>
                            <Text>Calories: {dailyTotals.calories} / {targets.calories}</Text>
                            <ProgressBar progress={getProgress(dailyTotals.calories, targets.calories)} color={theme.colors.primary} />
                        </View>

                        <View style={styles.metricRow}>
                            <Text>Protein: {dailyTotals.protein}g / {targets.protein}g</Text>
                            <ProgressBar progress={getProgress(dailyTotals.protein, targets.protein)} color={theme.colors.secondary} />
                        </View>

                        <View style={styles.metricRow}>
                            <Text>Carbs: {dailyTotals.carbs}g / {targets.carbs}g</Text>
                            <ProgressBar progress={getProgress(dailyTotals.carbs, targets.carbs)} color={theme.colors.tertiary} />
                        </View>

                        <View style={styles.metricRow}>
                            <Text>Fat: {dailyTotals.fat}g / {targets.fat}g</Text>
                            <ProgressBar progress={getProgress(dailyTotals.fat, targets.fat)} color={theme.colors.error} />
                        </View>
                    </Card.Content>
                </Card>

                <Text variant="titleMedium" style={styles.sectionTitle}>Recent Meals</Text>
                <FoodList items={dailyItems} onRemoveItem={() => { }} />

            </ScrollView>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('AddFood')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    summaryCard: {
        marginBottom: 20,
        elevation: 4,
    },
    metricRow: {
        marginVertical: 8,
    },
    sectionTitle: {
        marginVertical: 10,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
