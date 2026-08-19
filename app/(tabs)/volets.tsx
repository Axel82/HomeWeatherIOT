import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVoletsStore } from '../../src/store/useVoletsStore';
import { colors } from '../../src/theme/colors';
import { StoreStatusValue } from '../../src/models/Volet';
import { formatDateTime } from '../../src/utils/formatDate';

const ACTIONS: { status: StoreStatusValue; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { status: 'OPEN', label: 'Open', icon: 'arrow-up-circle-outline', color: colors.storeOpen },
  { status: 'CLOSE', label: 'Close', icon: 'arrow-down-circle-outline', color: colors.storeClose },
  { status: 'MY', label: 'My', icon: 'pause-circle-outline', color: colors.storeMy },
];

export default function VoletsScreen() {
  const { storeIds, statuses, isLoading, statusError, loadVolets, addVolet, removeVolet, sendCommand } =
    useVoletsStore();
  const [newStoreId, setNewStoreId] = useState('');
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadVolets();
  }, []);

  const handleAdd = async () => {
    if (!newStoreId.trim()) {
      Alert.alert('Nom manquant', 'Indiquez un nom pour le volet.');
      return;
    }
    setIsAdding(true);
    try {
      await addVolet(newStoreId);
      setNewStoreId('');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de créer le volet.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (storeId: string) => {
    Alert.alert('Supprimer', `Supprimer le volet "${storeId}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeVolet(storeId);
          } catch (e: any) {
            Alert.alert('Erreur', e.message || 'Impossible de supprimer le volet.');
          }
        },
      },
    ]);
  };

  const handleSendCommand = async (storeId: string, status: StoreStatusValue) => {
    const key = `${storeId}-${status}`;
    setSendingKey(key);
    try {
      await sendCommand(storeId, status);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || "Impossible d'envoyer la commande.");
    } finally {
      setSendingKey(null);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Gestionnaire de volets</Text>

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newStoreId}
            onChangeText={setNewStoreId}
            placeholder="Nom du volet (ex: Salon)"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={isAdding}>
            {isAdding ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Ionicons name="add" size={24} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {isLoading && storeIds.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={storeIds}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
            onRefresh={loadVolets}
            refreshing={isLoading}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun volet enregistré. Ajoutez-en un ci-dessus.</Text>
            }
            renderItem={({ item: storeId }) => {
              const status = statuses[storeId];
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardTitle}>{storeId}</Text>
                      {status ? (
                        <Text style={styles.cardStatus}>
                          {`${status.status} · ${formatDateTime(status.timestamp)}`}
                        </Text>
                      ) : statusError ? (
                        <View style={styles.statusErrorRow}>
                          <Ionicons name="warning-outline" size={14} color={colors.error} />
                          <Text style={styles.statusErrorText}>Statut distant indisponible</Text>
                        </View>
                      ) : (
                        <Text style={styles.cardStatus}>Aucune donnée</Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleRemove(storeId)}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionsRow}>
                    {ACTIONS.map((action) => {
                      const key = `${storeId}-${action.status}`;
                      const isActive = status?.status === action.status;
                      const isSending = sendingKey === key;
                      return (
                        <TouchableOpacity
                          key={action.status}
                          style={[
                            styles.actionButton,
                            { backgroundColor: isActive ? action.color : 'rgba(255,255,255,0.06)' },
                          ]}
                          onPress={() => handleSendCommand(storeId, action.status)}
                          disabled={isSending}
                        >
                          {isSending ? (
                            <ActivityIndicator size="small" color={colors.textPrimary} />
                          ) : (
                            <>
                              <Ionicons name={action.icon} size={20} color={colors.textPrimary} />
                              <Text style={styles.actionLabel}>{action.label}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
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
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
  },
  loader: {
    marginTop: 50,
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeaderText: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardStatus: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statusErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusErrorText: {
    color: colors.error,
    fontSize: 13,
    marginLeft: 4,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
