import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface AnalyticsGraphProps {
    protein: number;
    carbs: number;
    fat: number;
}

const screenWidth = Dimensions.get('window').width;

export const AnalyticsGraph: React.FC<AnalyticsGraphProps> = ({ protein, carbs, fat }) => {
    const data = [
        {
            name: 'Protein',
            population: protein,
            color: '#FF6384',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        },
        {
            name: 'Carbs',
            population: carbs,
            color: '#36A2EB',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        },
        {
            name: 'Fat',
            population: fat,
            color: '#FFCE56',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        },
    ];

    const total = protein + carbs + fat;

    if (total === 0) {
        return <Text style={styles.noDataText}>Add food to see macro breakdown</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Macro Breakdown</Text>
            <PieChart
                data={data}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                    backgroundColor: '#1cc910',
                    backgroundGradientFrom: '#eff3ff',
                    backgroundGradientTo: '#efefef',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    noDataText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666',
        marginVertical: 20,
    },
});
