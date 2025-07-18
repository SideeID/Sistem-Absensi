import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  password: Yup.string()
    .required('Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
});

export default function LoginScreen() {
  const { login, error, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const textColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const bgColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const tintColor =
    colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.headerContainer}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={styles.logo}
            resizeMode='contain'
          />
          <Text style={[styles.appTitle, { color: textColor }]}>
            SMK Mastrip
          </Text>
          <Text style={[styles.appSubtitle, { color: textColor }]}>
            Sistem Absensi Siswa
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: textColor }]}>Masuk</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={(values) => {
              login(values.email, values.password);
            }}
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
                    Email
                  </Text>
                  <TextInput
                    placeholder='Masukkan email'
                    placeholderTextColor='#999'
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    style={[
                      styles.input,
                      {
                        color: textColor,
                        borderColor:
                          touched.email && errors.email ? 'red' : '#ddd',
                      },
                    ]}
                    keyboardType='email-address'
                    autoCapitalize='none'
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>
                    Password
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder='Masukkan password'
                      placeholderTextColor='#999'
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      secureTextEntry={!isPasswordVisible}
                      style={[
                        styles.passwordInput,
                        {
                          color: textColor,
                          borderColor:
                            touched.password && errors.password
                              ? 'red'
                              : '#ddd',
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={togglePasswordVisibility}
                    >
                      <FontAwesome
                        name={isPasswordVisible ? 'eye' : 'eye-slash'}
                        size={20}
                        color='#666'
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: tintColor }]}
                  onPress={() => handleSubmit()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color='#ffffff' />
                  ) : (
                    <Text style={styles.buttonText}>Masuk</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColor }]}>
              Belum punya akun?{' '}
              <Link
                href='/register'
                style={[styles.link, { color: tintColor }]}
              >
                Daftar
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
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
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});
