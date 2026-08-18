import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { WeatherCard } from '../../src/components/WeatherCard';
import { WeatherChart } from '../../src/components/WeatherChart';
import { useWeatherStore } from '../../src/store/useWeatherStore';
import { colors } from '../../src/theme/colors';
import { formatDateTime, extractTimeForChart } from '../../src/utils/formatDate';

export default function DashboardScreen() {
  const { data, isLoading, error, fetchData } = useWeatherStore();

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  const latestData = data.length > 0 ? data[0] : null;
  const lastUpdate = latestData && latestData.created_at ? formatDateTime(latestData.created_at) : null;

  // Préparation des données pour les graphiques (on prend les 10 dernières pour la lisibilité, inversées chronologiquement)
  const chartDataRaw = data.slice(0, 10).reverse();
  const temperatureChartData = chartDataRaw
    .filter(d => d.temperature !== null)
    .map(d => ({ label: extractTimeForChart(d.created_at), value: d.temperature as number }));
  const humidityChartData = chartDataRaw
    .filter(d => d.humidity !== null)
    .map(d => ({ label: extractTimeForChart(d.created_at), value: d.humidity as number }));

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && data.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <>
          <View style={styles.cardsRow}>
            <WeatherCard 
              type="temperature" 
              value={latestData?.temperature ?? null} 
              lastUpdate={lastUpdate} 
            />
            <WeatherCard 
              type="humidity" 
              value={latestData?.humidity ?? null} 
              lastUpdate={lastUpdate} 
            />
          </View>

          <View style={styles.chartsContainer}>
            <WeatherChart 
              title="Évolution Température" 
              data={temperatureChartData} 
              type="temperature" 
            />
            <WeatherChart 
              title="Évolution Humidité" 
              data={humidityChartData} 
              type="humidity" 
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: 50,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 15,
  },
  chartsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    padding: 15,
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
});
