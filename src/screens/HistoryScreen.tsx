import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, CalendarList } from 'react-native-calendars';
import { Text, Card, useTheme, FAB, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getFoodLogsByRange } from '../services/FoodLogService';
import { FoodItem } from '../types';
import { format } from 'date-fns';

export const HistoryScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { userClient } = useAuth();

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [monthlyLogs, setMonthlyLogs] = useState<FoodItem[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [isCalendarVisible, setIsCalendarVisible] = useState(true);

    // Fetch logs for the displayed month
    const fetchMonthLogs = async (date: Date) => {
        if (!userClient) return;

        // Simple range: start of month to end of month
        // Ideally we fetch a bit more buffer
        const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();

        const logs = await getFoodLogsByRange(userClient, start, end);
        setMonthlyLogs(logs);

        // Mark dates with dots
        const marks: any = {};
        logs.forEach(log => {
            const d = format(new Date(log.timestamp), 'yyyy-MM-dd');
            if (!marks[d]) {
                marks[d] = { marked: true, dotColor: theme.colors.primary };
            }
        });

        // Highlight selected
        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: theme.colors.primary
        };

        setMarkedDates(marks);
    };

    useFocusEffect(
        useCallback(() => {
            fetchMonthLogs(new Date(selectedDate));
        }, [userClient, selectedDate])
    );

    const onDayPress = (day: any) => {
        setSelectedDate(day.dateString);
    };

    // Filter logs for selected date
    const dayLogs = monthlyLogs.filter(
        log => format(new Date(log.timestamp), 'yyyy-MM-dd') === selectedDate
    );

    const renderItem = ({ item }: { item: FoodItem }) => (
        <TouchableOpacity onPress={() => navigation.navigate('AddFood', { item })}>
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">{item.name}</Text>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                            {format(new Date(item.timestamp), 'h:mm a')}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            {item.calories} cal
                        </Text>
                        <Text variant="bodySmall">
                            P:{item.macros?.protein} C:{item.macros?.carbs} F:{item.macros?.fat}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    // Calculate daily totals
    const dailyTotals = dayLogs.reduce((acc, item) => ({
        cals: acc.cals + (item.calories || 0),
        p: acc.p + (item.macros?.protein || 0),
        c: acc.c + (item.macros?.carbs || 0),
        f: acc.f + (item.macros?.fat || 0),
    }), { cals: 0, p: 0, c: 0, f: 0 });

    const groupedLogs = monthlyLogs.reduce((acc, item) => {
        const date = format(new Date(item.timestamp), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, FoodItem[]>);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => setIsCalendarVisible(!isCalendarVisible)} style={styles.headerToggle}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {format(new Date(selectedDate), 'MMMM yyyy')}
                    </Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                        {isCalendarVisible ? 'Hide Calendar' : 'Show Calendar'}
                    </Text>
                </TouchableOpacity>
            </View>

            {isCalendarVisible && (
                <CalendarList
                    // Horizontal scrolling
                    horizontal={true}
                    pagingEnabled={true}
                    onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
                    markedDates={{
                        [selectedDate]: { selected: true, selectedColor: theme.colors.primary },
                        // Mark days with logs
                        ...Object.keys(groupedLogs).reduce((acc, date) => ({
                            ...acc,
                            [date]: { marked: true, dotColor: theme.colors.secondary, selected: date === selectedDate, selectedColor: theme.colors.primary }
                        }), {})
                    }}
                    theme={{
                        todayTextColor: theme.colors.primary,
                        arrowColor: theme.colors.primary,
                    }}
                    pastScrollRange={24}
                    futureScrollRange={2}
                    calendarHeight={300}
                />
            )}

            <View style={styles.listContainer}>
                <View style={styles.dateNav}>
                    {!isCalendarVisible && (
                        <IconButton icon="chevron-left" onPress={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() - 1);
                            setSelectedDate(format(d, 'yyyy-MM-dd'));
                        }} />
                    )}
                    <Text variant="titleMedium" style={styles.header}>
                        {format(new Date(selectedDate), 'EEEE, MMM d')}
                    </Text>
                    {!isCalendarVisible && (
                        <IconButton icon="chevron-right" onPress={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 1);
                            setSelectedDate(format(d, 'yyyy-MM-dd'));
                        }} />
                    )}
                </View>

                {/* Daily Summary Card */}
                {dayLogs.length > 0 && (
                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <View style={styles.summaryRow}>
                                <Text variant="bodyMedium">CAL: <Text style={{ fontWeight: 'bold' }}>{dailyTotals.cals}</Text></Text>
                                <Text variant="bodyMedium">P: <Text style={{ fontWeight: 'bold' }}>{dailyTotals.p.toFixed(0)}g</Text></Text>
                                <Text variant="bodyMedium">C: <Text style={{ fontWeight: 'bold' }}>{dailyTotals.c.toFixed(0)}g</Text></Text>
                                <Text variant="bodyMedium">F: <Text style={{ fontWeight: 'bold' }}>{dailyTotals.f.toFixed(0)}g</Text></Text>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                <FlatList
                    data={dayLogs}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    ListEmptyComponent={<Text style={styles.empty}>No meals logged.</Text>}
                />
            </View>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('AddFood', { date: selectedDate })}
                label="Add to this day"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 10,
        fontWeight: 'bold',
    },
    summaryCard: {
        marginBottom: 10,
        backgroundColor: '#e3f2fd', // Light blue tint
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    card: {
        marginBottom: 10,
        backgroundColor: 'white',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    headerContainer: {
        padding: 16,
        paddingBottom: 0,
        backgroundColor: '#fff',
    },
    headerToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    dateNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    }
});
