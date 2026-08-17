import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useWeatherStore } from '../../src/store/useWeatherStore';
import { colors } from '../../src/theme/colors';
import { formatDateTime } from '../../src/utils/formatDate';
import { WeatherData } from '../../src/models/WeatherData';

export default function HistoryScreen() {
  const { data, isLoading, fetchData } = useWeatherStore();

  useEffect(() => {
    // Si pas de données, on les charge
    if (data.length === 0) {
      fetchData();
    }
  }, []);

  const renderItem = ({ item }: { item: WeatherData }) => (
    <View style={styles.historyItem}>
      <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
      <View style={styles.valuesRow}>
        <Text style={styles.tempText}>{item.temperature?.toFixed(1) ?? '--'} °C</Text>
        <Text style={styles.separator}>·</Text>
        <Text style={styles.humText}>{item.humidity?.toFixed(0) ?? '--'} %</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && data.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune donnée disponible.</Text>
          }
          onRefresh={fetchData}
          refreshing={isLoading}
        />
      )}
    </View>
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
  listContainer: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempText: {
    color: colors.temperature,
    fontWeight: 'bold',
    fontSize: 16,
  },
  humText: {
    color: colors.humidity,
    fontWeight: 'bold',
    fontSize: 16,
  },
  separator: {
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
