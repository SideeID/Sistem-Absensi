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
    <View
      style={[
        styles.statCard,
        { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : 'white' },
      ]}
    >
      <View style={styles.statCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <FontAwesome name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.statPercentage, { color: textColor }]}>
          {percentage}%
        </Text>
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: textColor }]}>{title}</Text>
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
            {value} hari
          </Text>
        </View>
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: colorScheme === 'dark' ? '#333' : '#F0F0F0' },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: color, width: `${percentage}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressPercentage, { color: textColor }]}>
          {Math.round(percentage)}% dari total hari
        </Text>
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
        {stats ? (
          <>
            <View
              style={[
                styles.performanceCard,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : 'white',
                },
              ]}
            >
              <Text style={[styles.performanceTitle, { color: textColor }]}>
                Statistik Absensi
              </Text>
              <View style={styles.performanceContent}>
                <View
                  style={[
                    styles.performanceCircle,
                    {
                      borderColor: tintColor + '30',
                      backgroundColor: tintColor + '10',
                    },
                  ]}
                >
                  <Text
                    style={[styles.performancePercentage, { color: tintColor }]}
                  >
                    {stats.percentage}%
                  </Text>
                  <Text style={[styles.performanceLabel, { color: textColor }]}>
                    Kehadiran
                  </Text>
                </View>
                <View style={styles.performanceStats}>
                  <View style={styles.performanceStatItem}>
                    <Text
                      style={[
                        styles.performanceStatValue,
                        { color: '#4CAF50' },
                      ]}
                    >
                      {stats.total_present}
                    </Text>
                    <Text
                      style={[
                        styles.performanceStatLabel,
                        { color: textColor },
                      ]}
                    >
                      Hadir
                    </Text>
                  </View>
                  <View style={styles.performanceStatItem}>
                    <Text
                      style={[
                        styles.performanceStatValue,
                        { color: '#FF9800' },
                      ]}
                    >
                      {stats.total_late}
                    </Text>
                    <Text
                      style={[
                        styles.performanceStatLabel,
                        { color: textColor },
                      ]}
                    >
                      Terlambat
                    </Text>
                  </View>
                  <View style={styles.performanceStatItem}>
                    <Text
                      style={[
                        styles.performanceStatValue,
                        { color: '#F44336' },
                      ]}
                    >
                      {stats.total_absent}
                    </Text>
                    <Text
                      style={[
                        styles.performanceStatLabel,
                        { color: textColor },
                      ]}
                    >
                      Tidak Hadir
                    </Text>
                  </View>
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  performanceContent: {
    alignItems: 'center',
  },
  performanceCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  performancePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  performanceLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  performanceStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  performanceStatLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
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
