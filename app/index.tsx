import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function App() {
  const { token } = useAuth();

  if (!token) {
    return <Redirect href='/login' />;
  }

  return <Redirect href='/(tabs)' />;
}
