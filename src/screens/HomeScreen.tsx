import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, FAB, Card, ProgressBar, useTheme, TextInput } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { FoodList } from '../components/FoodList';
import { useAuth } from '../context/AuthContext';
import { getWeightLog, upsertWeightLog, deleteFoodLog } from '../services/FoodLogService';
import { format } from 'date-fns';

export const HomeScreen = ({ navigation }: any) => {
    const { targets, foodItems, refreshData } = useApp();
    const { userClient } = useAuth();
    const theme = useTheme();

    // Weight State
    const [weight, setWeight] = useState('');
    const [isSavingWeight, setIsSavingWeight] = useState(false);

    // Fetch today's weight on mount
    React.useEffect(() => {
        if (userClient) {
            getWeightLog(userClient, format(new Date(), 'yyyy-MM-dd'))
                .then(w => {
                    if (w) setWeight(w.toString());
                });
        }
    }, [userClient]);

    const handleSaveWeight = async () => {
        if (!userClient || !weight) return;
        setIsSavingWeight(true);
        await upsertWeightLog(userClient, format(new Date(), 'yyyy-MM-dd'), parseFloat(weight));
        setIsSavingWeight(false);
    };

    // Calculate daily totals
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

    const renderHeader = () => (
        <View>
            {/* Weight Input */}
            <Card style={styles.weightCard}>
                <Card.Content style={styles.weightRow}>
                    <Text variant="titleMedium" style={{ marginRight: 10 }}>Today's Weight:</Text>
                    <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        onBlur={handleSaveWeight}
                        keyboardType="numeric"
                        placeholder="kg"
                        mode="outlined"
                        dense
                        style={{ width: 80, backgroundColor: 'white', height: 40 }}
                        right={isSavingWeight ? <TextInput.Icon icon="check" /> : null}
                    />
                    <Text variant="bodyMedium" style={{ marginLeft: 10 }}>kg</Text>
                </Card.Content>
            </Card>

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
        </View>
    );

    return (
        <View style={styles.container}>
            <FoodList
                items={dailyItems}
                onRemoveItem={async (id) => {
                    if (userClient) {
                        await deleteFoodLog(userClient, id);
                        refreshData();
                    }
                }}
                ListHeaderComponent={renderHeader()}
                contentContainerStyle={styles.content}
            />

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
    weightCard: {
        marginBottom: 10,
        backgroundColor: 'white',
    },
    weightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
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
