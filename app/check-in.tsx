import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as Location from 'expo-location';
import axios from 'axios';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import {
  getFullURL,
  API_ENDPOINTS,
  getAuthHeaders,
} from '@/constants/ApiConfig';
import Colors from '@/constants/Colors';
import {
  FakeGPSDetector,
  FakeGPSDetectionResult,
} from '@/utils/fakeGPSDetector';
import FakeGPSWarningModal from '@/components/FakeGPSWarningModal';

const CheckInSchema = Yup.object().shape({
  latitude: Yup.number().required('Latitude is required'),
  longitude: Yup.number().required('Longitude is required'),
  address: Yup.string().required('Address is required'),
});

export default function CheckInScreen() {
  const { token, refreshUserData } = useAuth();
  const colorScheme = useColorScheme();
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [showFakeGPSWarning, setShowFakeGPSWarning] = useState(false);
  const [fakeGPSDetection, setFakeGPSDetection] =
    useState<FakeGPSDetectionResult | null>(null);

  const textColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const bgColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const tintColor =
    colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setIsGettingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const {
        latitude,
        longitude,
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        speed,
      } = currentLocation.coords;

      // Deteksi fake GPS
      const detectionResult = FakeGPSDetector.detectFakeGPS({
        latitude,
        longitude,
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        speed,
      });

      if (detectionResult.isSuspicious) {
        setFakeGPSDetection(detectionResult);
        setShowFakeGPSWarning(true);
        setIsGettingLocation(false);
        return;
      }

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = reverseGeocode[0]
        ? `${reverseGeocode[0].street || ''} ${
            reverseGeocode[0].district || ''
          } ${reverseGeocode[0].city || ''}`
        : 'Unknown location';

      setLocation({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        address: address.trim(),
      });
    } catch (err) {
      setError('Failed to get current location');
      console.error('Location error:', err);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleFakeGPSWarningClose = () => {
    setShowFakeGPSWarning(false);
    setFakeGPSDetection(null);
    setLocation({
      latitude: '',
      longitude: '',
      address: '',
    });
  };

  const handleContinueWithFakeGPS = () => {
    // User memaksa melanjutkan meskipun terdeteksi fake GPS
    // Lokasi tetap disimpan untuk proses selanjutnya
    console.warn('User melanjutkan meskipun terdeteksi fake GPS');
  };

  const handleCheckIn = async (values: typeof location) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        getFullURL(API_ENDPOINTS.ATTENDANCE.CHECKIN),
        {
          latitude: parseFloat(values.latitude),
          longitude: parseFloat(values.longitude),
          address: values.address,
        },
        {
          headers: getAuthHeaders(token!),
        },
      );

      if (response.data.success) {
        await refreshUserData();
        Alert.alert('Berhasil', 'Check in berhasil!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        setError(response.data.message || 'Check in gagal');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Terjadi kesalahan saat check in',
      );
      console.error('Check in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <FontAwesome
            name='map-marker'
            size={80}
            color={tintColor}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: textColor }]}>Check In</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Pastikan Anda berada di lokasi sekolah
          </Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Formik
          initialValues={location}
          validationSchema={CheckInSchema}
          enableReinitialize={true}
          onSubmit={handleCheckIn}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <View style={styles.form}>
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: tintColor }]}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <FontAwesome name='location-arrow' size={20} color='white' />
                )}
                <Text style={styles.locationButtonText}>
                  {isGettingLocation
                    ? 'Mendapatkan Lokasi...'
                    : 'Dapatkan Lokasi Saat Ini'}
                </Text>
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Latitude
                </Text>
                <Text
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                  ]}
                >
                  {values.latitude || 'Belum ada data'}
                </Text>
                {errors.latitude && touched.latitude && (
                  <Text style={styles.errorText}>{errors.latitude}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Longitude
                </Text>
                <Text
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                  ]}
                >
                  {values.longitude || 'Belum ada data'}
                </Text>
                {errors.longitude && touched.longitude && (
                  <Text style={styles.errorText}>{errors.longitude}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Alamat
                </Text>
                <Text
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                  ]}
                >
                  {values.address || 'Belum ada data'}
                </Text>
                {errors.address && touched.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.checkInButton,
                  { backgroundColor: tintColor },
                  (!values.latitude ||
                    !values.longitude ||
                    !values.address ||
                    isLoading) &&
                    styles.disabledButton,
                ]}
                onPress={() => handleSubmit()}
                disabled={
                  !values.latitude ||
                  !values.longitude ||
                  !values.address ||
                  isLoading
                }
              >
                {isLoading ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <>
                    <FontAwesome name='check' size={20} color='white' />
                    <Text style={styles.checkInButtonText}>Check In</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>

      {/* Fake GPS Warning Modal */}
      {fakeGPSDetection && (
        <FakeGPSWarningModal
          visible={showFakeGPSWarning}
          detectionResult={fakeGPSDetection}
          onClose={handleFakeGPSWarningClose}
          onContinueAnyway={handleContinueWithFakeGPS}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minHeight: 50,
    textAlignVertical: 'center',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    gap: 10,
  },
  checkInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
