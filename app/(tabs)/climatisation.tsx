import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { TemperatureDial } from '../../src/components/TemperatureDial';
import { useClimatisationStore } from '../../src/store/useClimatisationStore';

const MIN_TEMP = 16;
const MAX_TEMP = 30;
const FAN_SPEEDS = [1, 2, 3, 4] as const;
type FanSpeed = (typeof FAN_SPEEDS)[number];

export default function ClimatisationScreen() {
  const { state, isLoading, isSending, error, loadState, sendCommand } = useClimatisationStore();

  const [power, setPower] = useState(false);
  const [targetTemp, setTargetTemp] = useState(21);
  const [fanSpeed, setFanSpeed] = useState<FanSpeed>(2);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (!state) {
      return;
    }
    setPower(state.PowerStatus);
    setTargetTemp(state.TemperatureCommand);
    setFanSpeed(state.FanSpeed as FanSpeed);
  }, [state]);

  const handleSend = async () => {
    try {
      await sendCommand({
        PowerStatus: power,
        TemperatureCommand: targetTemp,
        FanSpeed: fanSpeed,
      });
      Alert.alert(
        'Instructions envoyées',
        `Alimentation : ${power ? 'ON' : 'OFF'}\nConsigne : ${targetTemp}°C\nVentilateur : niveau ${fanSpeed}`
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || "Impossible d'envoyer la commande.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Climatisation</Text>

      {isLoading && <ActivityIndicator color={colors.primary} style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Alimentation</Text>
        <View style={styles.powerRow}>
          <TouchableOpacity
            style={[styles.powerButton, { backgroundColor: power ? colors.primary : 'rgba(255,255,255,0.06)' }]}
            onPress={() => setPower(true)}
          >
            <Ionicons name="power" size={20} color={colors.textPrimary} />
            <Text style={styles.powerLabel}>ON</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.powerButton, { backgroundColor: !power ? '#3A3A3A' : 'rgba(255,255,255,0.06)' }]}
            onPress={() => setPower(false)}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.powerLabel}>OFF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Consigne de température</Text>
        <TemperatureDial value={targetTemp} min={MIN_TEMP} max={MAX_TEMP} onChange={setTargetTemp} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Vitesse du ventilateur</Text>
        <View style={styles.fanRow}>
          {FAN_SPEEDS.map((speedLevel) => {
            const isActive = fanSpeed === speedLevel;
            return (
              <TouchableOpacity
                key={speedLevel}
                style={[styles.fanButton, { backgroundColor: isActive ? colors.primary : 'rgba(255,255,255,0.06)' }]}
                onPress={() => setFanSpeed(speedLevel)}
              >
                <View style={styles.fanBars}>
                  {FAN_SPEEDS.map((barLevel) => (
                    <View
                      key={barLevel}
                      style={[
                        styles.fanBar,
                        { height: 6 + barLevel * 4 },
                        barLevel <= speedLevel && styles.fanBarFilled,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.fanLabel}>{speedLevel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={isSending}
      >
        {isSending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <>
            <Ionicons name="send" size={18} color={colors.textPrimary} />
            <Text style={styles.sendLabel}>Envoyer</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    marginBottom: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 14,
  },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  powerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  powerLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  fanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fanButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  fanBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
  },
  fanBar: {
    width: 4,
    marginHorizontal: 1.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  fanBarFilled: {
    backgroundColor: colors.textPrimary,
  },
  fanLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});
