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
import { FontAwesome } from '@expo/vector-icons';
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

const ChangePasswordSchema = Yup.object().shape({
  current_password: Yup.string().required('Password lama wajib diisi'),
  new_password: Yup.string()
    .required('Password baru wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
  confirm_password: Yup.string()
    .required('Konfirmasi password wajib diisi')
    .oneOf([Yup.ref('new_password')], 'Konfirmasi password tidak cocok'),
});

export default function ChangePasswordScreen() {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const textColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const bgColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const tintColor =
    colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  const initialValues = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };

  const handleChangePassword = async (values: typeof initialValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        getFullURL(API_ENDPOINTS.USER.CHANGE_PASSWORD),
        {
          current_password: values.current_password,
          new_password: values.new_password,
        },
        {
          headers: getAuthHeaders(token!),
        },
      );

      if (response.data.success) {
        Alert.alert('Berhasil', 'Password berhasil diubah', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'Gagal mengubah password',
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Terjadi kesalahan saat mengubah password',
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
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Ubah Password
          </Text>
          <Text style={[styles.headerSubtitle, { color: textColor }]}>
            Masukkan password lama dan password baru untuk mengubah password
            Anda
          </Text>
        </View>

        <Formik
          initialValues={initialValues}
          validationSchema={ChangePasswordSchema}
          onSubmit={handleChangePassword}
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
                  Password Lama
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      { color: textColor, borderColor: '#ddd' },
                      errors.current_password &&
                        touched.current_password && { borderColor: 'red' },
                    ]}
                    placeholder='Masukkan password lama'
                    value={values.current_password}
                    onChangeText={handleChange('current_password')}
                    onBlur={handleBlur('current_password')}
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <FontAwesome
                      name={showCurrentPassword ? 'eye' : 'eye-slash'}
                      size={20}
                      color='#666'
                    />
                  </TouchableOpacity>
                </View>
                {errors.current_password && touched.current_password && (
                  <Text style={styles.errorText}>
                    {errors.current_password}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Password Baru
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      { color: textColor, borderColor: '#ddd' },
                      errors.new_password &&
                        touched.new_password && { borderColor: 'red' },
                    ]}
                    placeholder='Masukkan password baru'
                    value={values.new_password}
                    onChangeText={handleChange('new_password')}
                    onBlur={handleBlur('new_password')}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <FontAwesome
                      name={showNewPassword ? 'eye' : 'eye-slash'}
                      size={20}
                      color='#666'
                    />
                  </TouchableOpacity>
                </View>
                {errors.new_password && touched.new_password && (
                  <Text style={styles.errorText}>{errors.new_password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  Konfirmasi Password Baru
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      { color: textColor, borderColor: '#ddd' },
                      errors.confirm_password &&
                        touched.confirm_password && { borderColor: 'red' },
                    ]}
                    placeholder='Konfirmasi password baru'
                    value={values.confirm_password}
                    onChangeText={handleChange('confirm_password')}
                    onBlur={handleBlur('confirm_password')}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesome
                      name={showConfirmPassword ? 'eye' : 'eye-slash'}
                      size={20}
                      color='#666'
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirm_password && touched.confirm_password && (
                  <Text style={styles.errorText}>
                    {errors.confirm_password}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: tintColor }]}
                onPress={() => handleSubmit()}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Mengubah...' : 'Ubah Password'}
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
  headerContainer: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  eyeButton: {
    paddingHorizontal: 15,
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
