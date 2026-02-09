import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { format, subDays, isSameDay } from 'date-fns';
import { FoodItem } from '../types';

interface MacroSliderProps {
    logs: FoodItem[];
    rangeDays?: number; // Total range to show (e.g., 7, 30, 90)
    daysPerBar?: number; // 1, 5, or 15
    mode?: 'stacked' | 'protein' | 'carbs' | 'fat';
    onDateSelect?: (date: Date) => void;
    selectedDate?: Date;
    page?: number; // 0 = current, 1 = previous period
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SPACING = 15;
const MAX_BAR_HEIGHT = 200;
const CHART_PADDING = 48; // Increase padding to prevent edge clipping

export const MacroSlider = ({ logs, rangeDays = 30, daysPerBar = 1, mode = 'stacked', onDateSelect, selectedDate, page = 0 }: MacroSliderProps) => {
    const theme = useTheme();

    // Calculate dynamic width
    const numBars = Math.ceil(rangeDays / daysPerBar);
    // (Screen - Padding - (Spacing * (Bars-1))) / Bars
    const BAR_WIDTH = (SCREEN_WIDTH - CHART_PADDING - (SPACING * (numBars - 1))) / numBars;

    // 1. Group logs by "Bucket"
    const chartData = React.useMemo(() => {
        const buckets: { cals: number, p: number, c: number, f: number, startDate: Date, count: number }[] = [];

        // Calculate offset based on page
        // page 0 = current period (today back to rangeDays)
        // page 1 = previous period (today - rangeDays back to rangeDays * 2)
        const pageOffsetDays = page * rangeDays;

        // Create buckets
        // For rangeDays = 30, daysPerBar = 5 -> 6 buckets
        const numBuckets = Math.ceil(rangeDays / daysPerBar);

        for (let i = 0; i < numBuckets; i++) {
            // Let's generate them Newest to Oldest then reverse

            // The 'startDate' for a bucket will be the oldest day in that bucket's range.
            // The 'endDate' for a bucket will be the newest day in that bucket's range.
            // We want to display Oldest -> Newest (Left -> Right)
            // So, we calculate buckets from newest to oldest, then reverse.

            // For bucket 'i' (0-indexed, where 0 is the newest bucket in the current page):
            // The newest day in this bucket is: Today - pageOffsetDays - (i * daysPerBar)
            // The oldest day in this bucket is: Today - pageOffsetDays - (i * daysPerBar) - daysPerBar + 1

            const bucketNewestDayOffset = pageOffsetDays + (i * daysPerBar);
            const bucketOldestDate = subDays(new Date(), bucketNewestDayOffset + daysPerBar - 1); // This is the actual 'startDate' for the bucket

            const bucket: any = { cals: 0, p: 0, c: 0, f: 0, startDate: bucketOldestDate, count: 0 };

            // Check logs within this bucket (from bucketOldestDate up to bucketNewestDate)
            for (let d = 0; d < daysPerBar; d++) {
                const targetDate = subDays(bucketOldestDate, -d); // Iterate forward from oldest date

                const items = logs.filter(l => isSameDay(new Date(l.timestamp), targetDate));

                items.forEach(item => {
                    bucket.cals += (item.calories || 0);
                    bucket.p += (item.macros?.protein || 0);
                    bucket.c += (item.macros?.carbs || 0);
                    bucket.f += (item.macros?.fat || 0);
                });
            }

            // Averaging
            if (daysPerBar > 1) {
                bucket.cals /= daysPerBar;
                bucket.p /= daysPerBar;
                bucket.c /= daysPerBar;
                bucket.f /= daysPerBar;
            }

            buckets.push(bucket);
        }

        return buckets.reverse(); // Oldest -> Newest
    }, [logs, rangeDays, daysPerBar, page]);

    // 2. Find Max for scaling based on mode
    const maxValue = React.useMemo(() => {
        return Math.max(...chartData.map(d => {
            if (mode === 'protein') return d.p;
            if (mode === 'carbs') return d.c;
            if (mode === 'fat') return d.f;
            return d.cals;
        }), mode === 'stacked' ? 2000 : 50);
    }, [chartData, mode]);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text variant="titleMedium">
                    {mode.toUpperCase()}
                    {daysPerBar > 1 ? ` (Avg / ${daysPerBar} days)` : ''}
                </Text>
            </View>

            <View style={styles.chartContainer}>
                {chartData.map((bucket, index) => {
                    let value = bucket.cals;
                    if (mode === 'protein') value = bucket.p;
                    if (mode === 'carbs') value = bucket.c;
                    if (mode === 'fat') value = bucket.f;

                    const height = (value / maxValue) * MAX_BAR_HEIGHT;
                    // Selection logic is tricky for buckets. 
                    // Let's highlight if selectedDate is within this bucket
                    let isSelected = false;
                    if (selectedDate) {
                        // Check if selectedDate is within [bucket.startDate, bucket.startDate + daysPerBar - 1]
                        for (let d = 0; d < daysPerBar; d++) {
                            if (isSameDay(subDays(bucket.startDate, -d), selectedDate)) {
                                isSelected = true;
                                break;
                            }
                        }
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dayContainer, { width: BAR_WIDTH, marginRight: index === chartData.length - 1 ? 0 : SPACING }]}
                            onPress={() => onDateSelect?.(subDays(bucket.startDate, -(daysPerBar - 1)))} // Select the newest day in the bucket
                        >
                            <View style={[styles.barContainer, { height: MAX_BAR_HEIGHT }]}>
                                {mode === 'stacked' ? (
                                    <View style={{ height: height, width: '100%', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#e0e0e0' }}>
                                        {/* Protein (Top) */}
                                        <View style={{ height: (bucket.p / (bucket.p + bucket.c + bucket.f || 1)) * height, backgroundColor: theme.colors.secondary, width: '100%' }} />
                                        {/* Carbs (Mid) */}
                                        <View style={{ height: (bucket.c / (bucket.p + bucket.c + bucket.f || 1)) * height, backgroundColor: theme.colors.tertiary, width: '100%' }} />
                                        {/* Fat (Bottom) */}
                                        <View style={{ height: (bucket.f / (bucket.p + bucket.c + bucket.f || 1)) * height, backgroundColor: theme.colors.error, width: '100%' }} />
                                    </View>
                                ) : (
                                    <View style={{
                                        height: height,
                                        width: '100%',
                                        borderRadius: 8,
                                        backgroundColor: mode === 'protein' ? theme.colors.secondary : mode === 'carbs' ? theme.colors.tertiary : theme.colors.error
                                    }} />
                                )}
                            </View>

                            <Text variant="labelSmall" style={[styles.dateLabel, isSelected && { color: theme.colors.primary, fontWeight: 'bold' }]} numberOfLines={1}>
                                {format(bucket.startDate, 'd/M')}
                                {daysPerBar > 1 ? `-${format(subDays(bucket.startDate, -(daysPerBar - 1)), 'd/M')}` : ''}
                            </Text>
                            <Text variant="labelSmall" style={styles.calLabel}>
                                {Math.round(value)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {mode === 'stacked' && (
                <View style={styles.legend}>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: theme.colors.secondary }]} /><Text>Protein</Text></View>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: theme.colors.tertiary }]} /><Text>Carbs</Text></View>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: theme.colors.error }]} /><Text>Fat</Text></View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    chartContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    dayContainer: {
        alignItems: 'center',
    },
    barContainer: {
        justifyContent: 'flex-end',
        marginBottom: 5,
        width: '100%'
    },
    dateLabel: {
        marginBottom: 2,
    },
    calLabel: {
        fontSize: 10,
        color: '#666',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
        gap: 20
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    }
});
