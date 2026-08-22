import { colors } from '../theme/colors';
import { WeatherMetricType } from '../components/WeatherCard';

export type MetricStatusLevel = 'low' | 'normal' | 'high' | 'veryHigh';

type MetricRange = {
  // domaine d'affichage de la jauge
  domainMin: number;
  domainMax: number;
  // seuils issus de la charte : bas < lowMax <= correct < highMin <= élevé < veryHighMin <= très élevé
  lowMax: number;
  highMin: number;
  veryHighMin: number;
};

const METRIC_RANGES: Record<WeatherMetricType, MetricRange> = {
  temperature: { domainMin: 0, domainMax: 36, lowMax: 16, highMin: 24, veryHighMin: 30 },
  humidity: { domainMin: 0, domainMax: 100, lowMax: 30, highMin: 60, veryHighMin: 75 },
  pressure: { domainMin: 960, domainMax: 1060, lowMax: 990, highMin: 1025, veryHighMin: 1040 },
  light: { domainMin: 0, domainMax: 1200, lowMax: 100, highMin: 500, veryHighMin: 1000 },
};

const LEVEL_COLORS: Record<MetricStatusLevel, string> = {
  low: colors.gaugeLow,
  normal: colors.gaugeNormal,
  high: colors.gaugeHigh,
  veryHigh: colors.gaugeVeryHigh,
};

export function getMetricLevel(type: WeatherMetricType, value: number): MetricStatusLevel {
  const { lowMax, highMin, veryHighMin } = METRIC_RANGES[type];
  if (value < lowMax) return 'low';
  if (value < highMin) return 'normal';
  if (value < veryHighMin) return 'high';
  return 'veryHigh';
}

export function getMetricGaugeInfo(type: WeatherMetricType, value: number | null) {
  const { domainMin, domainMax } = METRIC_RANGES[type];
  if (value === null) {
    return { fraction: 0, color: colors.gaugeTrack, level: null as MetricStatusLevel | null };
  }
  const level = getMetricLevel(type, value);
  const fraction = Math.min(1, Math.max(0, (value - domainMin) / (domainMax - domainMin)));
  return { fraction, color: LEVEL_COLORS[level], level };
}
