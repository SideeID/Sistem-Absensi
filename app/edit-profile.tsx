import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getFullURL,
  API_ENDPOINTS,
  getAuthHeaders,
} from '@/constants/ApiConfig';

const EditProfileSchema = Yup.object().shape({
  name: Yup.string().required('Nama wajib diisi'),
  phone: Yup.string().required('Nomor telepon wajib diisi'),
  kelas: Yup.string().required('Kelas wajib diisi'),
  jurusan: Yup.string().required('Jurusan wajib diisi'),
  avatar: Yup.string().url('URL avatar tidak valid'),
});

export default function EditProfileScreen() {
  const { user, token, refreshUserData } = useAuth();
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  const textColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const bgColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const tintColor =
    colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  const initialValues = {
    name: user?.name || '',
    phone: user?.phone || '',
    kelas: user?.kelas || '',
    jurusan: user?.jurusan || '',
    avatar: user?.avatar || '',
  };

  const handleUpdateProfile = async (values: typeof initialValues) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        getFullURL(API_ENDPOINTS.USER.PROFILE),
        values,
        {
          headers: getAuthHeaders(token!),
        },
      );

      if (response.data.success) {
        await refreshUserData();
        Alert.alert('Berhasil', 'Profil berhasil diperbarui', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'Gagal memperbarui profil',
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Terjadi kesalahan saat memperbarui profil',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer}>
        <Formik
          initialValues={initialValues}
          validationSchema={EditProfileSchema}
          onSubmit={handleUpdateProfile}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Nama Lengkap
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                    errors.name && touched.name && { borderColor: 'red' },
                  ]}
                  placeholder='Masukkan nama lengkap'
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                />
                {errors.name && touched.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Nomor Telepon
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                    errors.phone && touched.phone && { borderColor: 'red' },
                  ]}
                  placeholder='Masukkan nomor telepon'
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  keyboardType='phone-pad'
                />
                {errors.phone && touched.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Kelas
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                    errors.kelas && touched.kelas && { borderColor: 'red' },
                  ]}
                  placeholder='Masukkan kelas'
                  value={values.kelas}
                  onChangeText={handleChange('kelas')}
                  onBlur={handleBlur('kelas')}
                />
                {errors.kelas && touched.kelas && (
                  <Text style={styles.errorText}>{errors.kelas}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Jurusan
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                    errors.jurusan && touched.jurusan && { borderColor: 'red' },
                  ]}
                  placeholder='Masukkan jurusan'
                  value={values.jurusan}
                  onChangeText={handleChange('jurusan')}
                  onBlur={handleBlur('jurusan')}
                />
                {errors.jurusan && touched.jurusan && (
                  <Text style={styles.errorText}>{errors.jurusan}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Avatar URL (Opsional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: '#ddd' },
                    errors.avatar && touched.avatar && { borderColor: 'red' },
                  ]}
                  placeholder='Masukkan URL foto profil'
                  value={values.avatar}
                  onChangeText={handleChange('avatar')}
                  onBlur={handleBlur('avatar')}
                  multiline
                />
                {errors.avatar && touched.avatar && (
                  <Text style={styles.errorText}>{errors.avatar}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: tintColor }]}
                onPress={() => handleSubmit()}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Memperbarui...' : 'Perbarui Profil'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  form: {
    width: '100%',
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
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});
