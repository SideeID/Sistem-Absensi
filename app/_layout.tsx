import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
        <Stack.Screen name='login' options={{ headerShown: false }} />
        <Stack.Screen name='register' options={{ headerShown: false }} />
        <Stack.Screen
          name='edit-profile'
          options={{
            title: 'Edit Profil',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name='change-password'
          options={{
            title: 'Ubah Password',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name='check-in'
          options={{
            title: 'Check In',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name='check-out'
          options={{
            title: 'Check Out',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name='riwayat-absensi'
          options={{
            title: 'Riwayat Absensi',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name='statistik-absensi'
          options={{
            title: 'Statistik Absensi',
            headerBackTitle: 'Kembali',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
