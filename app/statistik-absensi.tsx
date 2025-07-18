import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
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

interface AttendanceStats {
  total_present: number;
  total_late: number;
  total_absent: number;
  percentage: number;
}

const { width } = Dimensions.get('window');

export default function StatistikAbsensiScreen() {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const textColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const bgColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const tintColor =
    colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        getFullURL(API_ENDPOINTS.ATTENDANCE.STATS),
        {
          headers: getAuthHeaders(token!),
        },
      );

      if (response.data.success) {
        setStats(response.data.data);
        setError('');
      } else {
        setError(response.data.message || 'Gagal mengambil data statistik');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Terjadi kesalahan saat mengambil data',
      );
      console.error('Fetch stats error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  const getTotalDays = () => {
    if (!stats) return 0;
    return stats.total_present + stats.total_late + stats.total_absent;
  };

  const getPercentage = (value: number) => {
    const total = getTotalDays();
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const StatCard = ({
    icon,
    title,
    value,
    color,
    percentage,
  }: {
    icon: React.ComponentProps<typeof FontAwesome>['name'];
    title: string;
    value: number;
    color: string;
    percentage: number;
  }) => (
    <View style={[styles.statCard, { backgroundColor: 'white' }]}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <FontAwesome name={icon} size={24} color='white' />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statPercentage}>{percentage}%</Text>
      </View>
    </View>
  );

  const ProgressBar = ({
    label,
    value,
    total,
    color,
  }: {
    label: string;
    value: number;
    total: number;
    color: string;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: textColor }]}>
            {label}
          </Text>
          <Text style={[styles.progressValue, { color: textColor }]}>
            {value} ({Math.round(percentage)}%)
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: color, width: `${percentage}%` },
            ]}
          />
        </View>
      </View>
    );
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
          Memuat statistik absensi...
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
          onPress={fetchStats}
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
          <FontAwesome name='bar-chart' size={60} color={tintColor} />
          <Text style={[styles.title, { color: textColor }]}>
            Statistik Absensi
          </Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Total Hari: {getTotalDays()}
          </Text>
        </View>

        {stats ? (
          <>
            <View
              style={[styles.performanceCard, { backgroundColor: 'white' }]}
            >
              <Text style={styles.performanceTitle}>Performa Kehadiran</Text>
              <View style={styles.performanceContent}>
                <View style={styles.performanceCircle}>
                  <Text
                    style={[styles.performancePercentage, { color: tintColor }]}
                  >
                    {stats.percentage}%
                  </Text>
                  <Text style={styles.performanceLabel}>Kehadiran</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                icon='check-circle'
                title='Hadir'
                value={stats.total_present}
                color='#4CAF50'
                percentage={getPercentage(stats.total_present)}
              />
              <StatCard
                icon='clock-o'
                title='Terlambat'
                value={stats.total_late}
                color='#FF9800'
                percentage={getPercentage(stats.total_late)}
              />
              <StatCard
                icon='times-circle'
                title='Tidak Hadir'
                value={stats.total_absent}
                color='#F44336'
                percentage={getPercentage(stats.total_absent)}
              />
            </View>

            <View
              style={[styles.progressSection, { backgroundColor: 'white' }]}
            >
              <Text style={styles.progressSectionTitle}>Detail Kehadiran</Text>

              <ProgressBar
                label='Hadir'
                value={stats.total_present}
                total={getTotalDays()}
                color='#4CAF50'
              />

              <ProgressBar
                label='Terlambat'
                value={stats.total_late}
                total={getTotalDays()}
                color='#FF9800'
              />

              <ProgressBar
                label='Tidak Hadir'
                value={stats.total_absent}
                total={getTotalDays()}
                color='#F44336'
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name='bar-chart' size={80} color='#9E9E9E' />
            <Text style={[styles.emptyText, { color: textColor }]}>
              Belum ada data statistik
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
  performanceCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  performanceContent: {
    alignItems: 'center',
  },
  performanceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  performancePercentage: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statPercentage: {
    fontSize: 12,
    color: '#999',
  },
  progressSection: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
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
