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
import { Camera, CameraCreateInput, buildCameraRtspUrl } from '../models/Camera';

interface CameraModalProps {
  visible: boolean;
  cameraToEdit: Camera | null;
  onClose: () => void;
  onSave: (data: CameraCreateInput) => Promise<void>;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  cameraToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [useDetailedConfig, setUseDetailedConfig] = useState(false);
  const [rtspUrl, setRtspUrl] = useState('');
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('554');
  const [channelPath, setChannelPath] = useState('/stream1');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (cameraToEdit) {
        setName(cameraToEdit.name);
        setLocation(cameraToEdit.location || '');
        setRtspUrl(cameraToEdit.rtsp_url || '');
        setSnapshotUrl(cameraToEdit.snapshot_url || '');
        setIpAddress(cameraToEdit.ip_address || '');
        setPort(cameraToEdit.port ? cameraToEdit.port.toString() : '554');
        setChannelPath(cameraToEdit.channel_path || '/stream1');
        setUsername(cameraToEdit.username || '');
        setPassword(cameraToEdit.password || '');
        setUseDetailedConfig(!!cameraToEdit.ip_address && !cameraToEdit.rtsp_url);
      } else {
        setName('');
        setLocation('');
        setRtspUrl('');
        setSnapshotUrl('');
        setIpAddress('');
        setPort('554');
        setChannelPath('/stream1');
        setUsername('');
        setPassword('');
        setUseDetailedConfig(false);
      }
    }
  }, [visible, cameraToEdit]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nom manquant', 'Veuillez renseigner un nom pour la caméra.');
      return;
    }

    let finalRtspUrl = rtspUrl.trim();
    if (useDetailedConfig) {
      if (!ipAddress.trim()) {
        Alert.alert('Adresse IP manquante', 'Veuillez saisir l\'adresse IP ou l\'hôte de la caméra.');
        return;
      }
      finalRtspUrl = buildCameraRtspUrl({
        ip_address: ipAddress.trim(),
        port: parseInt(port, 10) || 554,
        channel_path: channelPath.trim(),
        username: username.trim() || null,
        password: password.trim() || null,
      });
    } else if (!finalRtspUrl) {
      Alert.alert('URL RTSP manquante', 'Veuillez saisir l\'URL du flux RTSP.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        location: location.trim() || null,
        rtsp_url: finalRtspUrl,
        snapshot_url: snapshotUrl.trim() || null,
        ip_address: ipAddress.trim() || null,
        port: parseInt(port, 10) || 554,
        channel_path: channelPath.trim() || null,
        username: username.trim() || null,
        password: password.trim() || null,
        is_active: true,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d\'enregistrer la caméra.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrapper}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {cameraToEdit ? 'Modifier la caméra' : 'Ajouter une caméra IP'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Nom & Emplacement */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nom de la caméra *</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Entrée Principale"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Emplacement (Optionnel)</Text>
                <TextInput
                  style={styles.textInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ex: Rez-de-chaussée / Extérieur"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Mode switch: URL Directe vs Paramètres Détaillés */}
              <View style={styles.modeSwitchRow}>
                <TouchableOpacity
                  style={[styles.modeTab, !useDetailedConfig && styles.modeTabActive]}
                  onPress={() => setUseDetailedConfig(false)}
                >
                  <Text style={[styles.modeTabText, !useDetailedConfig && styles.modeTabTextActive]}>
                    URL Directe (RTSP / HLS / HTTP)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeTab, useDetailedConfig && styles.modeTabActive]}
                  onPress={() => setUseDetailedConfig(true)}
                >
                  <Text style={[styles.modeTabText, useDetailedConfig && styles.modeTabTextActive]}>
                    Paramètres Détaillés
                  </Text>
                </TouchableOpacity>
              </View>

              {!useDetailedConfig ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>URL du flux direct *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={rtspUrl}
                    onChangeText={setRtspUrl}
                    placeholder="rtsp://... ou http://.../stream.m3u8"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.hintText}>
                    Lecture 100% embarquée : flux RTSP, HLS (.m3u8) ou HTTP direct
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.row}>
                    <View style={[styles.fieldGroup, { flex: 2, marginRight: 8 }]}>
                      <Text style={styles.fieldLabel}>Adresse IP / Hôte *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={ipAddress}
                        onChangeText={setIpAddress}
                        placeholder="192.168.1.50"
                        placeholderTextColor={colors.textSecondary}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>Port RTSP</Text>
                      <TextInput
                        style={styles.textInput}
                        value={port}
                        onChangeText={setPort}
                        placeholder="554"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Chemin du flux (Canal)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={channelPath}
                      onChangeText={setChannelPath}
                      placeholder="/stream1 ou /live/ch0"
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.fieldLabel}>Utilisateur</Text>
                      <TextInput
                        style={styles.textInput}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="admin"
                        placeholderTextColor={colors.textSecondary}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>Mot de passe</Text>
                      <TextInput
                        style={styles.textInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* URL Snapshot / Image JPEG instantanée */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>URL d'instantané Snapshot (Optionnel)</Text>
                <TextInput
                  style={styles.textInput}
                  value={snapshotUrl}
                  onChangeText={setSnapshotUrl}
                  placeholder="http://192.168.1.50/cgi-bin/snapshot.cgi"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.hintText}>
                  Permet d'afficher une image JPEG rafraîchie en direct dans l'application
                </Text>
              </View>

              {/* Bouton de sauvegarde */}
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Enregistrer la caméra</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
