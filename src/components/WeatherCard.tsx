import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MetricGaugeBar } from './MetricGaugeBar';
import { getMetricGaugeInfo } from '../utils/metricStatus';

export type WeatherMetricType = 'temperature' | 'humidity' | 'pressure' | 'light';

interface WeatherCardProps {
  type: WeatherMetricType;
  value: number | null;
  lastUpdate: string | null;
}

const CARD_CONFIG: Record<WeatherMetricType, { icon: keyof typeof Ionicons.glyphMap; title: string; unit: string; color: string }> = {
  temperature: { icon: 'thermometer-outline', title: 'Température', unit: '°C', color: colors.temperature },
  humidity: { icon: 'water-outline', title: 'Humidité', unit: '%', color: colors.humidity },
  pressure: { icon: 'speedometer-outline', title: 'Pression', unit: 'hPa', color: colors.pressure },
  light: { icon: 'sunny-outline', title: 'Luminosité', unit: 'lx', color: colors.light },
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ type, value, lastUpdate }) => {
  const { icon: iconName, title, unit, color: mainColor } = CARD_CONFIG[type];
  const { fraction, color: gaugeColor } = getMetricGaugeInfo(type, value);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={iconName} size={20} color={mainColor} />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.middleRow}>
        <View style={styles.valueRow}>
          {value !== null ? (
            <>
              <Text style={styles.value} numberOfLines={1}>{value.toFixed(1)}</Text>
              <Text style={styles.unit} numberOfLines={1}>{unit}</Text>
            </>
          ) : (
            <Text style={styles.value} numberOfLines={1}>--</Text>
          )}
        </View>

        <MetricGaugeBar fraction={fraction} color={gaugeColor} height={GAUGE_HEIGHT} />
      </View>

      <View style={styles.footer}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.lastUpdate}>
          {lastUpdate ? `Dernière mesure : ${lastUpdate}` : 'Aucune donnée'}
        </Text>
      </View>
    </View>
  );
};

const GAUGE_HEIGHT = 90;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
    minHeight: 220,
    marginHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 15,
    lineHeight: 18,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  lastUpdate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 6,
    flexShrink: 1,
  },
});
