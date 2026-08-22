import React, { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const SIZE = 240;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;
const START_ANGLE = 135;
const SWEEP_ANGLE = 270;

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(angleDeg: number) {
  const rad = toRad(angleDeg);
  return {
    x: CENTER + RADIUS * Math.cos(rad),
    y: CENTER + RADIUS * Math.sin(rad),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function angleForValue(value: number, min: number, max: number) {
  return START_ANGLE + ((value - min) / (max - min)) * SWEEP_ANGLE;
}

export function TemperatureDial({ value, min, max, step = 1, disabled, onChange }: Props) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleTouch = (locationX: number, locationY: number) => {
    const dx = locationX - CENTER;
    const dy = locationY - CENTER;
    const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalized = (rawAngle + 360) % 360;
    let relative = (normalized - START_ANGLE + 360) % 360;

    if (relative > SWEEP_ANGLE) {
      const distanceToStart = 360 - relative;
      const distanceToEnd = relative - SWEEP_ANGLE;
      relative = distanceToStart < distanceToEnd ? 0 : SWEEP_ANGLE;
    }

    const fraction = relative / SWEEP_ANGLE;
    const rawValue = min + fraction * (max - min);
    const stepped = Math.round(rawValue / step) * step;
    const clamped = Math.min(max, Math.max(min, stepped));

    if (clamped !== valueRef.current) {
      valueRef.current = clamped;
      onChange(clamped);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
        onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
      }),
    [disabled, min, max, step]
  );

  const knobAngle = angleForValue(value, min, max);
  const knobPos = polarToCartesian(knobAngle);
  const arcPath = describeArc(START_ANGLE, knobAngle);
  const trackPath = describeArc(START_ANGLE, START_ANGLE + SWEEP_ANGLE);
  const displayValue = String(Math.round(value));

  return (
    <View style={[styles.wrapper, disabled && styles.disabled]} {...panResponder.panHandlers}>
      <Svg width={SIZE} height={SIZE}>
        <Path
          d={trackPath}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
        />
        {value > min && (
          <Path d={arcPath} stroke={colors.primary} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" />
        )}
        <Circle cx={knobPos.x} cy={knobPos.y} r={STROKE_WIDTH / 2 + 4} fill={colors.textPrimary} />
      </Svg>
      <View style={styles.centerLabel} pointerEvents="none">
        <Text style={styles.valueText}>{displayValue}°</Text>
        <Text style={styles.subLabel} numberOfLines={1}>
          Consigne
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '700',
  },
  subLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
