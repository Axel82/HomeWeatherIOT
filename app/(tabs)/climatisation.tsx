import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function ClimatisationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Climatisation</Text>
      <Text style={styles.emptyText}>À venir.</Text>
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
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
