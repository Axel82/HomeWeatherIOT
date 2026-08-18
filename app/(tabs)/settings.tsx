import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration Supabase</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.description}>
          Les identifiants Supabase sont configurés via les variables d'environnement (.env) pour des raisons de sécurité.
        </Text>
        
        <Text style={styles.label}>URL Supabase :</Text>
        <Text style={styles.value} selectable>
          {process.env.EXPO_PUBLIC_SUPABASE_URL || 'Non configurée'}
        </Text>
        
        <Text style={styles.label}>Clé Anonyme (Anon Key) :</Text>
        <Text style={styles.value} selectable>
          {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Configurée (cachée)' : 'Non configurée'}
        </Text>
      </View>
      
      <Text style={styles.note}>
        Note: Ne partagez jamais ces informations ou votre Service Role Key publiquement.
      </Text>
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
  infoCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
  },
  description: {
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 6,
  },
  note: {
    marginTop: 20,
    color: colors.error,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
