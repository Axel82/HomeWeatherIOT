import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { VoletsRepository } from '../services/VoletsRepository';

interface VoletInstructionsModalProps {
  visible: boolean;
  storeId: string | null;
  onClose: () => void;
}

export const VoletInstructionsModal: React.FC<VoletInstructionsModalProps> = ({
  visible,
  storeId,
  onClose,
}) => {
  const [openCommand, setOpenCommand] = useState('');
  const [closeCommand, setCloseCommand] = useState('');
  const [myCommand, setMyCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && storeId) {
      loadInstructions(storeId);
    } else {
      setOpenCommand('');
      setCloseCommand('');
      setMyCommand('');
    }
  }, [visible, storeId]);

  const loadInstructions = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await VoletsRepository.getInstructions(id);
      setOpenCommand(data.open_command ?? '');
      setCloseCommand(data.close_command ?? '');
      setMyCommand(data.my_command ?? '');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de récupérer les instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!storeId) return;
    setIsSaving(true);
    try {
      await VoletsRepository.updateInstructions(storeId, {
        open_command: openCommand.trim() ? openCommand.trim() : null,
        close_command: closeCommand.trim() ? closeCommand.trim() : null,
        my_command: myCommand.trim() ? myCommand.trim() : null,
      });
      Alert.alert('Succès', 'Les instructions ont été enregistrées avec succès.', [
        { text: 'OK', onPress: onClose },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer les instructions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrapper}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Gestionnaire d'instructions</Text>
                {storeId && (
                  <Text style={styles.modalSubtitle}>Volet : {storeId}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des instructions...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Instruction 1: Ouvrir */}
                <View style={styles.instructionGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="arrow-up-circle-outline" size={18} color={colors.storeOpen} />
                    <Text style={styles.instructionLabel}>Ouvrir</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={openCommand}
                    onChangeText={setOpenCommand}
                    placeholder="Commande pour ouvrir (champ libre)"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Instruction 2: Fermer */}
                <View style={styles.instructionGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="arrow-down-circle-outline" size={18} color={colors.storeClose} />
                    <Text style={styles.instructionLabel}>Fermer</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={closeCommand}
                    onChangeText={setCloseCommand}
                    placeholder="Commande pour fermer (champ libre)"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Instruction 3: MY */}
                <View style={styles.instructionGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="pause-circle-outline" size={18} color={colors.storeMy} />
                    <Text style={styles.instructionLabel}>MY</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={myCommand}
                    onChangeText={setMyCommand}
                    placeholder="Commande pour MY (champ libre)"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Bouton d'enregistrement en bas */}
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={colors.textPrimary} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color={colors.textPrimary} style={styles.saveIcon} />
                      <Text style={styles.saveButtonText}>Enregistrer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 16,
    marginBottom: 18,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  closeButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 15,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  instructionGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  instructionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
