import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

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

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={iconName} size={24} color={mainColor} />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.content}>
        {value !== null ? (
          <Text style={styles.value}>
            {value.toFixed(1)} <Text style={styles.unit}>{unit}</Text>
          </Text>
        ) : (
          <Text style={styles.value}>--</Text>
        )}
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

const styles = StyleSheet.create({
  card: {
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
    marginHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  lastUpdate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 6,
  },
});
