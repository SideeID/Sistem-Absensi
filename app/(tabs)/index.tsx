import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useEffect } from 'react';
import { useTodayAttendance } from '@/hooks/useTodayAttendance';

export default function TabOneScreen() {
  const { user, token, logout } = useAuth();
  const colorScheme = useColorScheme();
  const {
    todayAttendance,
    isLoading: attendanceLoading,
    canCheckIn,
    canCheckOut,
    hasCheckedIn,
    hasCheckedOut,
  } = useTodayAttendance();
  const tintColor =
    colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sistem Absensi</Text>
        <Text style={styles.headerSubtitle}>SMK Mastrip</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={
            user.avatar
              ? { uri: user.avatar }
              : require('@/assets/images/icon.png')
          }
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileDetail}>{user.nis}</Text>
          <Text style={styles.profileDetail}>
            {user.kelas} - {user.jurusan}
          </Text>
          <Text style={styles.profileDetail}>{user.email}</Text>
        </View>
      </View>

      <View style={[styles.attendanceStatusCard, { backgroundColor: 'white' }]}>
        <Text style={styles.attendanceStatusTitle}>
          Status Absensi Hari Ini
        </Text>
        {attendanceLoading ? (
          <View style={styles.attendanceLoading}>
            <ActivityIndicator size='small' color={tintColor} />
            <Text style={styles.attendanceLoadingText}>Memuat status...</Text>
          </View>
        ) : todayAttendance ? (
          <View style={styles.attendanceStatusContent}>
            <View style={styles.attendanceRow}>
              <FontAwesome name='sign-in' size={16} color='#4CAF50' />
              <Text style={styles.attendanceLabel}>Check In:</Text>
              <Text
                style={[
                  styles.attendanceValue,
                  { color: hasCheckedIn ? '#4CAF50' : '#999' },
                ]}
              >
                {hasCheckedIn
                  ? new Date(todayAttendance.check_in!).toLocaleTimeString(
                      'id-ID',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )
                  : 'Belum Check In'}
              </Text>
            </View>
            <View style={styles.attendanceRow}>
              <FontAwesome name='sign-out' size={16} color='#F44336' />
              <Text style={styles.attendanceLabel}>Check Out:</Text>
              <Text
                style={[
                  styles.attendanceValue,
                  { color: hasCheckedOut ? '#F44336' : '#999' },
                ]}
              >
                {hasCheckedOut
                  ? new Date(todayAttendance.check_out!).toLocaleTimeString(
                      'id-ID',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )
                  : 'Belum Check Out'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.attendanceEmptyText}>
            Belum ada data absensi hari ini
          </Text>
        )}
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Menu Absensi</Text>

        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={[styles.menuItem, !canCheckIn && styles.disabledMenuItem]}
            onPress={() => canCheckIn && router.push('/check-in' as any)}
            disabled={!canCheckIn}
          >
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: canCheckIn ? tintColor : '#cccccc' },
              ]}
            >
              <FontAwesome name='sign-in' size={24} color='white' />
            </View>
            <Text
              style={[styles.menuText, !canCheckIn && styles.disabledMenuText]}
            >
              Check In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, !canCheckOut && styles.disabledMenuItem]}
            onPress={() => canCheckOut && router.push('/check-out' as any)}
            disabled={!canCheckOut}
          >
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: canCheckOut ? tintColor : '#cccccc' },
              ]}
            >
              <FontAwesome name='sign-out' size={24} color='white' />
            </View>
            <Text
              style={[styles.menuText, !canCheckOut && styles.disabledMenuText]}
            >
              Check Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/riwayat-absensi' as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: tintColor }]}>
              <FontAwesome name='calendar' size={24} color='white' />
            </View>
            <Text style={styles.menuText}>Riwayat Absensi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/statistik-absensi' as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: tintColor }]}>
              <FontAwesome name='bar-chart' size={24} color='white' />
            </View>
            <Text style={styles.menuText}>Statistik</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: '#FF6B6B' }]}
        onPress={() => logout()}
      >
        <FontAwesome
          name='power-off'
          size={18}
          color='white'
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#2f95dc',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginHorizontal: 16,
    marginTop: -20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    marginTop: 17,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  menuContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendanceStatusCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  attendanceLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  attendanceLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  attendanceStatusContent: {
    gap: 10,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    minWidth: 80,
  },
  attendanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  attendanceEmptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  disabledMenuText: {
    color: '#999',
  },
});
