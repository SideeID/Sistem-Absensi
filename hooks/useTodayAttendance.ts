import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import {
  getFullURL,
  API_ENDPOINTS,
  getAuthHeaders,
} from '@/constants/ApiConfig';

interface TodayAttendance {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  user: any;
  created_at: string;
  updated_at: string;
}

export const useTodayAttendance = () => {
  const { token } = useAuth();
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayAttendance = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        getFullURL(API_ENDPOINTS.ATTENDANCE.CHECK_STATUS),
        {
          headers: getAuthHeaders(token),
        },
      );

      if (response.data.success) {
        setTodayAttendance(response.data.data);
        setError(null);
      } else {
        setTodayAttendance(null);
        setError(response.data.message);
      }
    } catch (err: any) {
      console.log('Today attendance check error:', err.response?.data?.message);
      setTodayAttendance(null);
      setError(
        err.response?.data?.message || 'Error checking today attendance',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchTodayAttendance();
    }, [token]),
  );

  const refreshAttendanceStatus = useCallback(() => {
    fetchTodayAttendance();
  }, [token]);

  const hasCheckedIn = todayAttendance?.check_in != null;
  const hasCheckedOut = todayAttendance?.check_out != null;
  const canCheckIn = !hasCheckedIn;
  const canCheckOut = hasCheckedIn && !hasCheckedOut;

  return {
    todayAttendance,
    isLoading,
    error,
    hasCheckedIn,
    hasCheckedOut,
    canCheckIn,
    canCheckOut,
    refresh: fetchTodayAttendance,
    refreshAttendanceStatus,
  };
};
