import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  onToggleFullScreen?: () => void;
}

/**
 * Lecteur vidéo natif expo-video pour flux HTTP/HTTPS (HLS .m3u8, MP4, HTTP Live stream).
 * Ne doit être appelé qu'avec une URL http:// ou https:// valide.
 */
const SafeHttpVideoPlayer: React.FC<{
  url: string;
  autoPlay?: boolean;
  onFallbackToSnapshot?: () => void;
  hasSnapshotFallback?: boolean;
}> = ({ url, autoPlay = true, onFallbackToSnapshot, hasSnapshotFallback = false }) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [retryKey, setRetryKey] = useState(0);

  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = true;
    if (autoPlay) {
      p.play();
    }
  });

  useEffect(() => {
    if (!player) return;

    const statusSub = player.addListener('statusChange', (s) => {
      if (s.status === 'error') {
        setStatus('error');
        setErrorMessage(s.error?.message || 'Flux vidéo inaccessible ou format non pris en charge.');
      } else if (s.status === 'readyToPlay') {
        setStatus('ready');
        setErrorMessage(null);
      } else if (s.status === 'loading') {
        setStatus('loading');
      }
    });

    const playingSub = player.addListener('playingChange', (p) => {
      setIsPlaying(p.isPlaying);
    });

    const mutedSub = player.addListener('mutedChange', (m) => {
      setIsMuted(m.muted);
    });

    return () => {
      statusSub.remove();
      playingSub.remove();
      mutedSub.remove();
    };
  }, [player, retryKey]);

  const handleTogglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleToggleMute = () => {
    if (!player) return;
    player.muted = !player.muted;
  };

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage(null);
    setRetryKey((k) => k + 1);
    if (player) {
      player.replay();
    }
  };

  if (status === 'error') {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconCircle}>
          <Ionicons name="videocam-off-outline" size={30} color={colors.error} />
        </View>
        <Text style={styles.errorTitle}>Flux direct indisponible</Text>
        <Text style={styles.errorSubtitle}>{errorMessage}</Text>

        <View style={styles.errorActionsRow}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="reload" size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>

          {hasSnapshotFallback && onFallbackToSnapshot && (
            <TouchableOpacity style={styles.fallbackButton} onPress={onFallbackToSnapshot}>
              <Ionicons name="images-outline" size={15} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.fallbackButtonText}>Voir Instantané Live</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.videoInnerContainer}>
      <VideoView
        style={styles.videoView}
        player={player}
        nativeControls={false}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
        startsPictureInPictureAutomatically
        contentFit="contain"
      />

      {status === 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Connexion au flux...</Text>
        </View>
      )}

      {/* Barre de contrôles vidéo intégrée */}
      <View style={styles.videoControlsOverlay}>
        <TouchableOpacity style={styles.controlButton} onPress={handleTogglePlay}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleToggleMute}>
          <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Sous-composant dédié au flux instantané direct (Live Snapshot Image Stream)
 * Rafraîchit les images JPEG en direct de manière 100% embarquée et légère.
 */
const EmbeddedSnapshotStream: React.FC<{
  snapshotUrl: string;
  autoRefresh?: boolean;
}> = ({ snapshotUrl, autoRefresh = true }) => {
  const [snapshotKey, setSnapshotKey] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(autoRefresh);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    if (!isLiveActive || !snapshotUrl) return;

    const interval = setInterval(() => {
      setSnapshotKey(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveActive, snapshotUrl]);

  const handleManualRefresh = () => {
    setHasError(false);
    setIsLoading(true);
    setSnapshotKey(Date.now());
  };

  const handleToggleLive = () => {
    setIsLiveActive((prev) => !prev);
  };

  const currentUri = `${snapshotUrl}${snapshotUrl.includes('?') ? '&' : '?'}_t=${snapshotKey}`;

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconCircle}>
          <Ionicons name="image-outline" size={30} color={colors.error} />
        </View>
        <Text style={styles.errorTitle}>Instantané non disponible</Text>
        <Text style={styles.errorSubtitle}>
          Vérifiez l'URL de snapshot ou la connectivité réseau de la caméra.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleManualRefresh}>
          <Ionicons name="reload" size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
          <Text style={styles.retryButtonText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.snapshotContainer}>
      <Image
        key={snapshotKey}
        source={{ uri: currentUri }}
        style={styles.snapshotImage}
        resizeMode="contain"
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
          setLastUpdated(new Date().toLocaleTimeString());
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {isLoading && (
        <View style={styles.snapshotLoaderOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {/* Barre de contrôles instantané embarqué */}
      <View style={styles.snapshotControlsOverlay}>
        <View style={styles.snapshotStatusBadge}>
          <View style={[styles.pulseDot, { backgroundColor: isLiveActive ? colors.success : colors.textSecondary }]} />
          <Text style={styles.snapshotStatusText}>
            {isLiveActive ? 'DIRECT 2s' : 'PAUSE'}
          </Text>
          <Text style={styles.snapshotTimeText}>{lastUpdated}</Text>
        </View>

        <View style={styles.snapshotButtonsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isLiveActive && styles.controlButtonActive]}
            onPress={handleToggleLive}
          >
            <Ionicons name={isLiveActive ? 'pause' : 'play'} size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleManualRefresh}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const CameraStreamPlayer: React.FC<CameraStreamPlayerProps> = ({
  camera,
  autoPlay = true,
  onClose,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const fullUrl = buildCameraRtspUrl(camera);
  const isHttpVideo = fullUrl.startsWith('http://') || fullUrl.startsWith('https://');
  const isRtsp = fullUrl.startsWith('rtsp://');
  const hasSnapshot = !!camera.snapshot_url && camera.snapshot_url.trim().length > 0;

  // Si c'est un flux HTTP(S), on peut tenter le lecteur vidéo, sinon si snapshot disponible on utilise le snapshot
  const [activeMode, setActiveMode] = useState<'video' | 'snapshot'>(
    isHttpVideo ? 'video' : 'snapshot'
  );

  const cleanDisplayUrl =
    activeMode === 'video' && isHttpVideo
      ? fullUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••@')
      : camera.snapshot_url || (fullUrl ? fullUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••@') : 'Non configuré');

  return (
    <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      {/* En-tête avec titre et indicateur direct */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <View style={styles.liveIndicator} />
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

        {/* Sélecteur de mode si les deux sont disponibles */}
        {isHttpVideo && hasSnapshot && (
          <View style={styles.modeToggleGroup}>
            <TouchableOpacity
              style={[styles.modeButton, activeMode === 'video' && styles.modeButtonActive]}
              onPress={() => setActiveMode('video')}
            >
              <Ionicons
                name="videocam"
                size={13}
                color={activeMode === 'video' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  activeMode === 'video' && styles.modeButtonTextActive,
                ]}
              >
                Vidéo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, activeMode === 'snapshot' && styles.modeButtonActive]}
              onPress={() => setActiveMode('snapshot')}
            >
              <Ionicons
                name="image"
                size={13}
                color={activeMode === 'snapshot' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  activeMode === 'snapshot' && styles.modeButtonTextActive,
                ]}
              >
                Instantané
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerActions}>
          {onToggleFullScreen && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onToggleFullScreen}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={isFullScreen ? 'contract-outline' : 'expand-outline'}
                size={18}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onClose}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Zone de lecture embarquée principale */}
      <View style={[styles.videoWrapper, isFullScreen && styles.videoWrapperFullScreen]}>
        {activeMode === 'video' && isHttpVideo ? (
          <SafeHttpVideoPlayer
            url={fullUrl}
            autoPlay={autoPlay}
            hasSnapshotFallback={hasSnapshot}
            onFallbackToSnapshot={() => setActiveMode('snapshot')}
          />
        ) : hasSnapshot && camera.snapshot_url ? (
          <EmbeddedSnapshotStream
            snapshotUrl={camera.snapshot_url}
            autoRefresh={autoPlay}
          />
        ) : isRtsp ? (
          <View style={styles.noConfigContainer}>
            <View style={styles.rtspIconBox}>
              <Ionicons name="videocam" size={28} color={colors.primary} />
            </View>
            <Text style={styles.noConfigTitle}>Flux RTSP configuré</Text>
            <Text style={styles.noConfigSubtitle}>
              Pour un affichage vidéo direct embarqué, renseignez un flux HTTP/HLS (.m3u8) ou l'URL Snapshot JPEG dans les réglages de la caméra.
            </Text>
          </View>
        ) : (
          <View style={styles.noConfigContainer}>
            <Ionicons name="warning-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.noConfigTitle}>Source non configurée</Text>
            <Text style={styles.noConfigSubtitle}>
              Ajoutez une URL de flux (HTTP, HLS ou Snapshot) dans les réglages.
            </Text>
          </View>
        )}
      </View>

      {/* Pied d'information flux */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerModeBadge}>
            {activeMode === 'video' && isHttpVideo
              ? 'FLUX VIDÉO INTÉGRÉ'
              : hasSnapshot
              ? 'INSTANTANÉ DIRECT EMBARQUÉ'
              : 'FLUX EN ATTENTE'}
          </Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {cleanDisplayUrl}
          </Text>
        </View>
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  cameraLocation: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 2,
    marginRight: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#05070c',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoWrapperFullScreen: {
    flex: 1,
    aspectRatio: undefined,
  },
  videoInnerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  videoControlsOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  snapshotContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
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
  snapshotControlsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  snapshotStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  snapshotTimeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  snapshotButtonsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  controlButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  errorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 76, 76, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: 12,
    lineHeight: 16,
  },
  errorActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.3)',
  },
  fallbackButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  noConfigContainer: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rtspIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  noConfigTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  noConfigSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 290,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerModeBadge: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  urlText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
