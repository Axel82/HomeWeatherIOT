import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCamerasStore } from '../../src/store/useCamerasStore';
import { colors } from '../../src/theme/colors';
import { Camera, CameraCreateInput } from '../../src/models/Camera';
import { CameraCard } from '../../src/components/CameraCard';
import { CameraModal } from '../../src/components/CameraModal';
import { CameraPlayerModal } from '../../src/components/CameraPlayerModal';

export default function CamerasScreen() {
  const { cameras, isLoading, error, loadCameras, addCamera, updateCamera, removeCamera } =
    useCamerasStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [cameraToEdit, setCameraToEdit] = useState<Camera | null>(null);
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);

  useEffect(() => {
    loadCameras();
  }, []);

  const handleOpenAdd = () => {
    setCameraToEdit(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (camera: Camera) => {
    setCameraToEdit(camera);
    setModalVisible(true);
  };

  const handleSaveCamera = async (data: CameraCreateInput) => {
    if (cameraToEdit) {
      await updateCamera(cameraToEdit.id, data);
    } else {
      await addCamera(data);
    }
  };

  const handleDeleteCamera = (camera: Camera) => {
    Alert.alert(
      'Supprimer la caméra',
      `Voulez-vous vraiment supprimer "${camera.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCamera(camera.id);
            } catch (err: any) {
              Alert.alert('Erreur', err.message || 'Impossible de supprimer la caméra.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Caméras IP</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenAdd}>
          <Ionicons name="add" size={20} color={colors.textPrimary} style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && cameras.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Chargement des caméras...</Text>
        </View>
      ) : (
        <FlatList
          data={cameras}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CameraCard
              camera={item}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteCamera}
              onOpenPlayer={setFullscreenCamera}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadCameras}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={56} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucune caméra configurée</Text>
              <Text style={styles.emptySubtitle}>
                Appuyez sur le bouton "Ajouter" pour connecter une caméra IP locale via son flux RTSP.
              </Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={handleOpenAdd}>
                <Ionicons name="add-circle-outline" size={20} color={colors.textPrimary} style={{ marginRight: 6 }} />
                <Text style={styles.addButtonText}>Ajouter une caméra</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal Ajout / Modification */}
      <CameraModal
        visible={modalVisible}
        cameraToEdit={cameraToEdit}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCamera}
      />

      {/* Modal Plein Écran */}
      <CameraPlayerModal
        visible={!!fullscreenCamera}
        camera={fullscreenCamera}
        onClose={() => setFullscreenCamera(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loaderText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 300,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
});
