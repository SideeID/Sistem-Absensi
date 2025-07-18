import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import {
  getFullURL,
  API_ENDPOINTS,
  getAuthHeaders,
} from '@/constants/ApiConfig';

export type User = {
  id: string;
  nis: string;
  name: string;
  kelas: string;
  jurusan: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  NIS: string;
  Kelas: string;
  Jurusan: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading auth data from storage', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        getFullURL(API_ENDPOINTS.AUTH.REGISTER),
        userData,
      );

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;

        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);

        router.replace('/(tabs)');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred during registration',
      );
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(getFullURL(API_ENDPOINTS.AUTH.LOGIN), {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;

        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);

        router.replace('/(tabs)');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!token) return;

    try {
      const response = await axios.get(getFullURL(API_ENDPOINTS.USER.PROFILE), {
        headers: getAuthHeaders(token),
      });

      if (response.data.success) {
        const updatedUser = response.data.data;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        getFullURL(API_ENDPOINTS.USER.LOGOUT),
        {},
        {
          headers: getAuthHeaders(token!),
        },
      );

      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      setToken(null);
      setUser(null);

      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
