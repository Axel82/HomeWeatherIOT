import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
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

/**
 * Sous-composant dédié à la lecture des flux HTTP/HTTPS (HLS, MP4, etc.)
 * Isolé pour que useVideoPlayer ne soit exécuté que si le flux est compatible expo-video.
 */
const HttpVideoView: React.FC<{ url: string; autoPlay?: boolean }> = ({ url, autoPlay = true }) => {
  const [streamError, setStreamError] = useState<string | null>(null);

  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    if (autoPlay) {
      p.play();
    }
  });

  useEffect(() => {
    if (!player) return;

    const statusSubscription = player.addListener('statusChange', (status) => {
      if (status.status === 'error') {
        setStreamError(status.error?.message || 'Erreur lors de la lecture du flux vidéo.');
      } else if (status.status === 'readyToPlay') {
        setStreamError(null);
      }
    });

    return () => {
      statusSubscription.remove();
    };
  }, [player]);

  if (streamError) {
    return (
      <View style={styles.messageBox}>
        <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
        <Text style={styles.errorTitle}>Erreur de lecture</Text>
        <Text style={styles.errorSubtitle}>{streamError}</Text>
      </View>
    );
  }

  return (
    <VideoView
      style={styles.videoView}
      player={player}
      fullscreenOptions={{ enable: true }}
      allowsPictureInPicture
      startsPictureInPictureAutomatically
      contentFit="contain"
    />
  );
};

export const CameraStreamPlayer: React.FC<CameraStreamPlayerProps> = ({
  camera,
  autoPlay = true,
  onClose,
  isFullScreen = false,
}) => {
  const [snapshotKey, setSnapshotKey] = useState(Date.now());
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState(false);

  const fullUrl = buildCameraRtspUrl(camera);
  const isRtsp = fullUrl.startsWith('rtsp://') || (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://'));
  const isHttpStream = fullUrl.startsWith('http://') || fullUrl.startsWith('https://');
  const hasSnapshot = !!camera.snapshot_url;

  // Actualisation automatique du snapshot toutes les 5 secondes si écran actif
  useEffect(() => {
    if (!hasSnapshot) return;
    const interval = setInterval(() => {
      setSnapshotKey(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, [hasSnapshot]);

  const handleOpenExternal = async () => {
    if (!fullUrl) {
      Alert.alert('Flux non configuré', 'Aucune adresse de flux n\'a été renseignée pour cette caméra.');
      return;
    }

    try {
      await Linking.openURL(fullUrl);
    } catch (err) {
      Alert.alert(
        'Lecteur externe requis',
        `Impossible d'ouvrir directement le flux RTSP.\n\nPour lire ce flux sur votre appareil, installez l'application gratuite VLC ou un lecteur RTSP compatible.\n\nURL : ${fullUrl}`
      );
    }
  };

  const handleRefreshSnapshot = () => {
    setSnapshotError(false);
    setSnapshotLoading(true);
    setSnapshotKey(Date.now());
  };

  const cleanDisplayUrl = fullUrl ? fullUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••@') : 'Non configuré';

  return (
    <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      {/* En-tête avec titre et bouton fermer */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <View style={[styles.liveIndicator, { backgroundColor: isRtsp ? colors.primary : colors.success }]} />
            <Text style={styles.cameraName} numberOfLines={1}>
              {camera.name}
            </Text>
          </View>
          {camera.location && (
            <Text style={styles.cameraLocation} numberOfLines={1}>{camera.location}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {hasSnapshot && (
            <TouchableOpacity style={styles.iconButton} onPress={handleRefreshSnapshot} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="refresh" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          {isRtsp && (
            <TouchableOpacity style={styles.iconButton} onPress={handleOpenExternal} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="open-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity style={styles.iconButton} onPress={onClose} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Zone d'affichage : Snapshot / HTTP Video / Vue RTSP */}
      <View style={[styles.videoWrapper, isFullScreen && styles.videoWrapperFullScreen]}>
        {!fullUrl && !hasSnapshot ? (
          <View style={styles.messageBox}>
            <Ionicons name="warning-outline" size={36} color={colors.error} />
            <Text style={styles.messageText}>URL non configurée</Text>
          </View>
        ) : hasSnapshot && !snapshotError ? (
          // Affichage Snapshot (Image rafraîchie)
          <View style={styles.snapshotWrapper}>
            <Image
              source={{ uri: `${camera.snapshot_url}${camera.snapshot_url?.includes('?') ? '&' : '?'}_t=${snapshotKey}` }}
              style={styles.snapshotImage}
              resizeMode="contain"
              onLoadStart={() => setSnapshotLoading(true)}
              onLoadEnd={() => setSnapshotLoading(false)}
              onError={() => {
                setSnapshotError(true);
                setSnapshotLoading(false);
              }}
            />
            {snapshotLoading && (
              <View style={styles.snapshotLoaderOverlay}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            {isRtsp && (
              <TouchableOpacity style={styles.rtspOverlayBadge} onPress={handleOpenExternal}>
                <Ionicons name="play-circle" size={16} color={colors.textPrimary} style={{ marginRight: 4 }} />
                <Text style={styles.rtspOverlayBadgeText}>Ouvrir VLC</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : isHttpStream ? (
          // Affichage Flux HTTP/HLS avec expo-video
          <HttpVideoView url={fullUrl} autoPlay={autoPlay} />
        ) : (
          // Affichage Flux RTSP (Info & Bouton VLC)
          <View style={styles.rtspPlaceholder}>
            <View style={styles.rtspIconCircle}>
              <Ionicons name="videocam" size={32} color={colors.primary} />
            </View>
            <Text style={styles.rtspTitle}>Flux RTSP Prêt</Text>
            <Text style={styles.rtspSubtitle}>
              {camera.ip_address ? `${camera.ip_address}:${camera.port || 554}` : 'Flux réseau local'}
            </Text>

            <TouchableOpacity style={styles.vlcButton} onPress={handleOpenExternal}>
              <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.vlcButtonText}>Ouvrir dans VLC / Lecteur</Text>
            </TouchableOpacity>

            <Text style={styles.rtspHint}>
              Le protocole RTSP se lit directement dans une application compatible comme VLC.
            </Text>
          </View>
        )}
      </View>

      {/* Pied d'information flux */}
      <View style={styles.footer}>
        <Text style={styles.urlText} numberOfLines={1}>
          Flux: {cleanDisplayUrl}
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
    backgroundColor: '#0a0e17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapperFullScreen: {
    flex: 1,
    aspectRatio: undefined,
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  snapshotWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  snapshotImage: {
    width: '100%',
    height: '100%',
  },
  snapshotLoaderOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  rtspOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 180, 216, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rtspOverlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rtspPlaceholder: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  rtspIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rtspTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  rtspSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  vlcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  vlcButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rtspHint: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 290,
    opacity: 0.8,
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
