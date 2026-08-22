import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface MetricGaugeBarProps {
  fraction: number; // 0..1
  color: string;
  height?: number;
}

const BAR_WIDTH = 8;

export const MetricGaugeBar: React.FC<MetricGaugeBarProps> = ({ fraction, color, height = 64 }) => {
  const fillHeight = Math.round(height * fraction);

  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { height: fillHeight, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: colors.gaugeTrack,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    borderRadius: BAR_WIDTH / 2,
  },
});
