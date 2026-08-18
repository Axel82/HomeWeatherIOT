import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { configureSupabaseClient } from '../../src/config/supabase';
import {
  clearSupabaseCredentials,
  getDefaultSupabaseCredentials,
  loadSupabaseCredentials,
  saveSupabaseCredentials,
} from '../../src/config/supabaseConfig';
import { useWeatherStore } from '../../src/store/useWeatherStore';
import { colors } from '../../src/theme/colors';

export default function SettingsScreen() {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fetchData = useWeatherStore((state) => state.fetchData);

  useEffect(() => {
    loadSupabaseCredentials().then((credentials) => {
      setUrl(credentials.url);
      setAnonKey(credentials.anonKey);
    });
  }, []);

  const handleSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      Alert.alert('Champs manquants', "L'URL et la clé anonyme sont obligatoires.");
      return;
    }

    setIsSaving(true);
    try {
      const credentials = { url: url.trim(), anonKey: anonKey.trim() };
      await saveSupabaseCredentials(credentials);
      configureSupabaseClient(credentials);
      await fetchData();
      Alert.alert('Enregistré', 'La configuration Supabase a été mise à jour.');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer la configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await clearSupabaseCredentials();
      const defaults = getDefaultSupabaseCredentials();
      setUrl(defaults.url);
      setAnonKey(defaults.anonKey);
      configureSupabaseClient(defaults);
      await fetchData();
      Alert.alert('Réinitialisé', 'La configuration par défaut (.env) a été restaurée.');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de réinitialiser la configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Configuration Supabase</Text>

        <View style={styles.infoCard}>
          <Text style={styles.description}>
            Ces identifiants sont sauvegardés sur l'appareil et remplacent les valeurs du fichier
            .env. Laissez vide puis réinitialisez pour revenir à la configuration par défaut.
          </Text>

          <Text style={styles.label}>URL Supabase</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://xxxx.supabase.co"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={styles.label}>Clé Anonyme (Anon Key)</Text>
          <TextInput
            style={styles.input}
            value={anonKey}
            onChangeText={setAnonKey}
            placeholder="sb_publishable_..."
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton, isSaving && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>Réinitialiser (.env)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Ne partagez jamais ces informations ou votre Service Role Key publiquement.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 6,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  note: {
    marginTop: 20,
    color: colors.error,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
