import React from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Camera } from '../models/Camera';
import { CameraStreamPlayer } from './CameraStreamPlayer';

interface CameraPlayerModalProps {
  visible: boolean;
  camera: Camera | null;
  onClose: () => void;
}

export const CameraPlayerModal: React.FC<CameraPlayerModalProps> = ({
  visible,
  camera,
  onClose,
}) => {
  if (!camera) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.titleInfo}>
            <Text style={styles.title} numberOfLines={1}>{camera.name}</Text>
            {camera.location && (
              <Text style={styles.subtitle}>{camera.location}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Player */}
        <View style={styles.playerWrapper}>
          <CameraStreamPlayer camera={camera} autoPlay isFullScreen onClose={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleInfo: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerWrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
});
