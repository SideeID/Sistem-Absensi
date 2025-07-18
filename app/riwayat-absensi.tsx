import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import {
  getFullURL,
  API_ENDPOINTS,
  getAuthHeaders,
} from '@/constants/ApiConfig';
import Colors from '@/constants/Colors';

interface AttendanceRecord {
  date: string;
  check_in: string;
  check_out: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface AttendanceHistory {
  history: AttendanceRecord[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
}

export default function RiwayatAbsensiScreen() {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const [attendanceData, setAttendanceData] =
    useState<AttendanceHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const textColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const bgColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const tintColor =
    colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get(
        getFullURL(API_ENDPOINTS.ATTENDANCE.HISTORY),
        {
          headers: getAuthHeaders(token!),
        },
      );

      if (response.data.success) {
        setAttendanceData(response.data.data);
        setError('');
      } else {
        setError(
          response.data.message || 'Gagal mengambil data riwayat absensi',
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Terjadi kesalahan saat mengambil data',
      );
      console.error('Fetch attendance history error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAttendanceHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    const time = new Date(timeString);
    return time.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return '#4CAF50';
      case 'late':
        return '#FF9800';
      case 'absent':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'Hadir';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: bgColor },
        ]}
      >
        <ActivityIndicator size='large' color={tintColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Memuat riwayat absensi...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: bgColor },
        ]}
      >
        <FontAwesome name='exclamation-triangle' size={60} color='#F44336' />
        <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: tintColor }]}
          onPress={fetchAttendanceHistory}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <FontAwesome name='history' size={60} color={tintColor} />
          <Text style={[styles.title, { color: textColor }]}>
            Riwayat Absensi
          </Text>
          {attendanceData && (
            <Text style={[styles.subtitle, { color: textColor }]}>
              Total: {attendanceData.pagination.total} data
            </Text>
          )}
        </View>

        {attendanceData && attendanceData.history.length > 0 ? (
          <View style={styles.historyContainer}>
            {attendanceData.history.map((record, index) => (
              <View
                key={index}
                style={[styles.historyCard, { backgroundColor: 'white' }]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(record.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(record.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.timeContainer}>
                  <View style={styles.timeRow}>
                    <FontAwesome name='sign-in' size={16} color='#4CAF50' />
                    <Text style={styles.timeLabel}>Check In:</Text>
                    <Text style={styles.timeValue}>
                      {formatTime(record.check_in)}
                    </Text>
                  </View>

                  <View style={styles.timeRow}>
                    <FontAwesome name='sign-out' size={16} color='#F44336' />
                    <Text style={styles.timeLabel}>Check Out:</Text>
                    <Text style={styles.timeValue}>
                      {formatTime(record.check_out)}
                    </Text>
                  </View>
                </View>

                <View style={styles.locationContainer}>
                  <FontAwesome name='map-marker' size={14} color='#9E9E9E' />
                  <Text style={styles.locationText} numberOfLines={2}>
                    {record.location.address}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name='calendar-times-o' size={80} color='#9E9E9E' />
            <Text style={[styles.emptyText, { color: textColor }]}>
              Belum ada riwayat absensi
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    gap: 15,
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeContainer: {
    marginBottom: 15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    minWidth: 80,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    opacity: 0.7,
  },
});
