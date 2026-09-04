import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Camera, buildCameraRtspUrl } from '../models/Camera';
import { CameraStreamPlayer } from './CameraStreamPlayer';

interface CameraCardProps {
  camera: Camera;
  onEdit: (camera: Camera) => void;
  onDelete: (camera: Camera) => void;
  onOpenPlayer: (camera: Camera) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onEdit,
  onDelete,
  onOpenPlayer,
}) => {
  const rtspUrl = buildCameraRtspUrl(camera);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.titleRow}>
            <View style={styles.statusDot} />
            <Text style={styles.cameraName} numberOfLines={1}>
              {camera.name}
            </Text>
          </View>
          {camera.location && (
            <Text style={styles.cameraLocation} numberOfLines={1}>
              {camera.location}
            </Text>
          )}
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => onEdit(camera)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => onDelete(camera)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stream Player / Preview Box */}
      <View style={styles.playerContainer}>
        <CameraStreamPlayer camera={camera} autoPlay={false} />
      </View>

      {/* Footer Controls */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.fullScreenButton}
          onPress={() => onOpenPlayer(camera)}
        >
          <Ionicons name="expand-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.fullScreenButtonText}>Agrandir le flux</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  cameraName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
  },
  cameraLocation: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    padding: 4,
  },
  playerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  fullScreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 180, 216, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fullScreenButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
