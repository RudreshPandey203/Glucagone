import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';

export const AnalyticsScreen = () => {
    const { foodItems } = useApp();
    const theme = useTheme();

    // Process data for charts (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = {
        labels: last7Days.map(date => date.slice(5)), // MM-DD
        datasets: [
            {
                data: last7Days.map(date => {
                    const dayItems = foodItems.filter(item => new Date(item.timestamp).toISOString().split('T')[0] === date);
                    return dayItems.reduce((sum, item) => sum + (item.calories || 0), 0);
                }),
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
                strokeWidth: 2 // optional
            }
        ],
        legend: ["Calories"] // optional
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Calorie Trend (Last 7 Days)" />
                <Card.Content>
                    <LineChart
                        data={chartData}
                        width={Dimensions.get("window").width - 40} // from react-native
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="kcal"
                        yAxisInterval={1} // optional, defaults to 1
                        chartConfig={{
                            backgroundColor: theme.colors.surface,
                            backgroundGradientFrom: theme.colors.surface,
                            backgroundGradientTo: theme.colors.surface,
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                            labelColor: (opacity = 1) => theme.colors.onSurface,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726"
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Macro Trends (Last 7 Days)" />
                <Card.Content>
                    <LineChart
                        data={{
                            labels: last7Days.map(date => date.slice(5)),
                            datasets: [
                                {
                                    data: last7Days.map(date => {
                                        const dayItems = foodItems.filter(item => new Date(item.timestamp).toISOString().split('T')[0] === date);
                                        return dayItems.reduce((sum, item) => sum + (item.macros?.protein || 0), 0);
                                    }),
                                    color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Protein - Red/Pink
                                    strokeWidth: 2
                                },
                                {
                                    data: last7Days.map(date => {
                                        const dayItems = foodItems.filter(item => new Date(item.timestamp).toISOString().split('T')[0] === date);
                                        return dayItems.reduce((sum, item) => sum + (item.macros?.carbs || 0), 0);
                                    }),
                                    color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Carbs - Blue
                                    strokeWidth: 2
                                },
                                {
                                    data: last7Days.map(date => {
                                        const dayItems = foodItems.filter(item => new Date(item.timestamp).toISOString().split('T')[0] === date);
                                        return dayItems.reduce((sum, item) => sum + (item.macros?.fat || 0), 0);
                                    }),
                                    color: (opacity = 1) => `rgba(255, 206, 86, ${opacity})`, // Fat - Yellow
                                    strokeWidth: 2
                                }
                            ],
                            legend: ["Protein", "Carbs", "Fat"]
                        }}
                        width={Dimensions.get("window").width - 40}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="g"
                        chartConfig={{
                            backgroundColor: theme.colors.surface,
                            backgroundGradientFrom: theme.colors.surface,
                            backgroundGradientTo: theme.colors.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => theme.colors.onSurface,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    card: {
        marginBottom: 16,
        elevation: 4,
    },
});
