import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FakeGPSDetectionResult } from '@/utils/fakeGPSDetector';

interface FakeGPSWarningModalProps {
  visible: boolean;
  detectionResult: FakeGPSDetectionResult;
  onClose: () => void;
  onContinueAnyway?: () => void;
}

const { width } = Dimensions.get('window');

export default function FakeGPSWarningModal({
  visible,
  detectionResult,
  onClose,
  onContinueAnyway,
}: FakeGPSWarningModalProps) {
  const getRiskColor = () => {
    switch (detectionResult.riskLevel) {
      case 'high':
        return '#FF4444';
      case 'medium':
        return '#FF8800';
      case 'low':
        return '#FFAA00';
      default:
        return '#FF4444';
    }
  };

  const getRiskText = () => {
    switch (detectionResult.riskLevel) {
      case 'high':
        return 'TINGGI';
      case 'medium':
        return 'SEDANG';
      case 'low':
        return 'RENDAH';
      default:
        return 'TINGGI';
    }
  };

  const handleForceClose = () => {
    Alert.alert(
      'Peringatan',
      'Sistem mendeteksi kemungkinan penggunaan fake GPS. Absensi mungkin tidak valid. Apakah Anda yakin ingin melanjutkan?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Lanjutkan',
          style: 'destructive',
          onPress: () => {
            onContinueAnyway?.();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getRiskColor() },
              ]}
            >
              <FontAwesome name='shield' size={24} color='white' />
            </View>
            <Text style={styles.headerTitle}>Deteksi Lokasi Mencurigakan</Text>
            <Text style={styles.riskLevel}>
              Tingkat Risiko: {getRiskText()}
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.mainMessage}>
              Sistem mendeteksi aktivitas lokasi yang tidak wajar. Pastikan GPS
              perangkat Anda aktif dan tidak menggunakan aplikasi pihak ketiga.
            </Text>

            <View style={styles.reasonsContainer}>
              {detectionResult.reasons.map((reason, index) => (
                <View key={index} style={styles.reasonItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onClose}
            >
              <Text style={styles.primaryButtonText}>Ulangi Deteksi</Text>
            </TouchableOpacity>

            {onContinueAnyway && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleForceClose}
              >
                <Text style={styles.secondaryButtonText}>Tetap Lanjutkan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width * 0.85,
    maxWidth: 380,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  riskLevel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    padding: 24,
  },
  mainMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  reasonsContainer: {
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginTop: 8,
    marginRight: 12,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
