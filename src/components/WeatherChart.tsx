import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { WeatherMetricType } from './WeatherCard';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface WeatherChartProps {
  title: string;
  data: ChartDataPoint[];
  type: WeatherMetricType;
}

const screenWidth = Dimensions.get('window').width;

const CHART_CONFIG: Record<WeatherMetricType, { color: string; rgb: string; unitSuffix: string }> = {
  temperature: { color: colors.temperature, rgb: '255,107,107', unitSuffix: '°' },
  humidity: { color: colors.humidity, rgb: '78,205,196', unitSuffix: '%' },
  pressure: { color: colors.pressure, rgb: '155,140,255', unitSuffix: 'hPa' },
  light: { color: colors.light, rgb: '255,209,102', unitSuffix: 'lx' },
};

export const WeatherChart: React.FC<WeatherChartProps> = ({ title, data, type }) => {
  const { color: mainColor, rgb, unitSuffix } = CHART_CONFIG[type];

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Pas assez de données pour le graphique</Text>
        </View>
      </View>
    );
  }

  // Pour éviter des graphiques illisibles, on limite le nombre d'étiquettes affichées
  // si on a beaucoup de points (ex: plus de 10 points on affiche 1 sur 3 ou seulement la première et la dernière)
  const labels = data.map(d => d.label);
  const values = data.map(d => d.value);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: values,
            },
          ],
        }}
        width={screenWidth - 40} // margins
        height={220}
        yAxisSuffix={unitSuffix}
        fromZero
        formatYLabel={(yLabel) => Math.round(Number(yLabel)).toString()}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(${rgb}, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(160,160,160, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: mainColor,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
