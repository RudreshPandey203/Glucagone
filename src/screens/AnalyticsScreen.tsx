import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, SegmentedButtons, Button, IconButton, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { subDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getFoodLogsByRange } from '../services/FoodLogService';
import { MacroSlider } from '../components/MacroSlider';
import { FoodItem } from '../types';

export const AnalyticsScreen = () => {
    const { userClient } = useAuth();
    const theme = useTheme();
    const [logs, setLogs] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Range Logic
    // value = daysPerBar: 1 (Weekly), 5 (Monthly), 15 (3 Months)
    // label "Weekly" -> Show 7 bars of 1 day = 7 days range
    // label "Monthly" -> Show 6 bars of 5 days = 30 days range
    // label "3 Months" -> Show 6 bars of 15 days = 90 days range
    const [viewMode, setViewMode] = useState('weekly');

    // Page: 0 is current, 1 is previous block
    const [page, setPage] = useState(0);

    const getRangeSettings = () => {
        switch (viewMode) {
            case 'weekly': return { range: 7, daysPerBar: 1 };
            case 'monthly': return { range: 30, daysPerBar: 5 };
            case '3months': return { range: 90, daysPerBar: 15 };
            default: return { range: 7, daysPerBar: 1 };
        }
    };

    const { range, daysPerBar } = getRangeSettings();

    const fetchData = async () => {
        if (!userClient) return;
        setLoading(true);
        try {
            // We need to fetch enough data for the current page
            // Start Date = Today - ((page + 1) * range)
            // End Date = Today - (page * range)

            // To be safe, let's just fetch everything for now if the dataset isn't huge, 
            // OR fetch specific range. Implementation Plan said fetch corresponding.

            const endOffset = page * range;
            const startOffset = (page + 1) * range;

            const end = subDays(new Date(), endOffset).getTime(); // "Newest" time
            const start = subDays(new Date(), startOffset).getTime(); // "Oldest" time

            // Note: FoodLogService.getFoodLogsByRange uses timestamps
            // We might want to buffer a bit or just fetch a large chunk if pagination is frequent.
            // Let's fetch strict range for now.
            const data = await getFoodLogsByRange(userClient, start, end);
            setLogs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [userClient, viewMode, page])
    );

    const handleNext = () => {
        if (page > 0) setPage(p => p - 1);
    };

    const handlePrev = () => {
        setPage(p => p + 1);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Analytics</Text>
            </View>

            <SegmentedButtons
                value={viewMode}
                onValueChange={(val) => { setViewMode(val); setPage(0); }}
                buttons={[
                    { value: 'weekly', label: 'Week' },
                    { value: 'monthly', label: 'Month' },
                    { value: '3months', label: '3 Months' },
                ]}
                style={styles.segment}
            />

            <View style={styles.pageControls}>
                <IconButton icon="chevron-left" onPress={handlePrev} />
                <Text variant="bodyMedium">
                    {page === 0 ? "Current Period" : `${page} Period(s) Ago`}
                </Text>
                <IconButton icon="chevron-right" onPress={handleNext} disabled={page === 0} />
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <>
                    <MacroSlider
                        logs={logs}
                        rangeDays={range}
                        daysPerBar={daysPerBar}
                        mode="stacked"
                        page={page}
                    />
                    <MacroSlider logs={logs} rangeDays={range} daysPerBar={daysPerBar} mode="protein" page={page} />
                    <MacroSlider logs={logs} rangeDays={range} daysPerBar={daysPerBar} mode="carbs" page={page} />
                    <MacroSlider logs={logs} rangeDays={range} daysPerBar={daysPerBar} mode="fat" page={page} />
                </>
            )}

            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                <Text variant="titleMedium" style={{ marginBottom: 10 }}>Weight Trend (Last 30 Days)</Text>
                <WeightChart />
            </View>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

// Simple Placeholder Limit - Ideally install react-native-chart-kit
const WeightChart = () => {
    const { userClient } = useAuth();
    const [data, setData] = useState<{ date: string, weight: number }[]>([]);

    useEffect(() => {
        if (!userClient) return;
        userClient
            .from('weight_logs')
            .select('*')
            .order('date', { ascending: false })
            .limit(30)
            .then(({ data }: { data: { date: string, weight: number }[] | null }) => {
                if (data) setData(data.reverse());
            });
    }, [userClient]);

    if (data.length === 0) return <Text>No weight data recorded yet.</Text>;

    const maxW = Math.max(...data.map(d => d.weight)) + 1;
    const minW = Math.min(...data.map(d => d.weight)) - 1;
    const range = maxW - minW || 1;
    const HEIGHT = 150;

    return (
        <View style={{ height: HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}>
            {data.map((d, i) => {
                const h = ((d.weight - minW) / range) * (HEIGHT - 20) + 20;
                return (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ width: 6, height: h, backgroundColor: '#6200ee', borderRadius: 3 }} />
                        {i % 5 === 0 && <Text style={{ fontSize: 8, marginTop: 4 }}>{d.date.slice(8)}</Text>}
                    </View>
                )
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 10,
    },
    segment: {
        marginBottom: 10,
    },
    pageControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pageTitle: {
        marginBottom: 20,
        fontWeight: 'bold',
    }
});
