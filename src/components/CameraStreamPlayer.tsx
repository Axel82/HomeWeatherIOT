import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../theme/colors';
import { Camera, buildCameraRtspUrl } from '../models/Camera';

interface CameraStreamPlayerProps {
  camera: Camera;
  autoPlay?: boolean;
  onClose?: () => void;
  isFullScreen?: boolean;
}

export const CameraStreamPlayer: React.FC<CameraStreamPlayerProps> = ({
  camera,
  autoPlay = true,
  onClose,
  isFullScreen = false,
}) => {
  const [streamError, setStreamError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const fullUrl = buildCameraRtspUrl(camera);

  const player = useVideoPlayer(fullUrl, (p) => {
    p.loop = true;
    if (autoPlay) {
      p.play();
    }
  });

  useEffect(() => {
    if (!player) return;

    const statusSubscription = player.addListener('statusChange', (status) => {
      if (status.status === 'error') {
        setStreamError(status.error?.message || 'Erreur de connexion au flux RTSP');
      } else if (status.status === 'readyToPlay') {
        setStreamError(null);
      }
    });

    return () => {
      statusSubscription.remove();
    };
  }, [player, retryKey]);

  const handleRetry = () => {
    setStreamError(null);
    setRetryKey((prev) => prev + 1);
    if (player) {
      try {
        player.replace(fullUrl);
        player.play();
      } catch (e: any) {
        setStreamError(e.message || 'Impossible de relancer le flux');
      }
    }
  };

  return (
    <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      {/* En-tête avec titre et bouton fermer */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <View style={styles.liveIndicator} />
            <Text style={styles.cameraName} numberOfLines={1}>
              {camera.name}
            </Text>
          </View>
          {camera.location && (
            <Text style={styles.cameraLocation}>{camera.location}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleRetry}>
            <Ionicons name="reload" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Zone Vidéo */}
      <View style={styles.videoWrapper}>
        {!fullUrl ? (
          <View style={styles.messageBox}>
            <Ionicons name="warning-outline" size={36} color={colors.error} />
            <Text style={styles.messageText}>URL RTSP non configurée</Text>
          </View>
        ) : streamError ? (
          <View style={styles.messageBox}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
            <Text style={styles.errorTitle}>Flux indisponible</Text>
            <Text style={styles.errorSubtitle}>
              Vérifiez que la caméra est allumée et accessible sur le réseau local.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <VideoView
            style={styles.videoView}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            startsPictureInPictureAutomatically
            contentFit="contain"
          />
        )}
      </View>

      {/* Pied d'information flux */}
      <View style={styles.footer}>
        <Text style={styles.urlText} numberOfLines={1}>
          Flux: {fullUrl ? fullUrl.replace(/:\/\/.*:.*@/, '://***:***@') : 'Non configuré'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fullScreenContainer: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerInfo: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  cameraName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraLocation: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  messageBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.error,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  urlText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
