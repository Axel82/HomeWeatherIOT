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
                      <Ionicons name="cloud-upload-outline" size={20} color={colors.textPrimary} style={styles.saveIcon} />
                      <Text style={styles.saveButtonText}>Envoyer à la base de données</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 500,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 14,
    marginBottom: 16,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
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
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 10,
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
