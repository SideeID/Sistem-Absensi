import { StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const colorScheme = useColorScheme();
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={
              user.avatar
                ? { uri: user.avatar }
                : require('@/assets/images/icon.png')
            }
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <FontAwesome name='camera' size={16} color='white' />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileRole}>
          {user.kelas} - {user.jurusan}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

        <View style={styles.infoItem}>
          <FontAwesome
            name='id-card'
            size={20}
            color={tintColor}
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>NIS</Text>
            <Text style={styles.infoValue}>{user.nis}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <FontAwesome
            name='envelope'
            size={20}
            color={tintColor}
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>

        {user.phone && (
          <View style={styles.infoItem}>
            <FontAwesome
              name='phone'
              size={20}
              color={tintColor}
              style={styles.infoIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nomor Telepon</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoItem}>
          <FontAwesome
            name='users'
            size={20}
            color={tintColor}
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Kelas</Text>
            <Text style={styles.infoValue}>{user.kelas}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <FontAwesome
            name='graduation-cap'
            size={20}
            color={tintColor}
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Jurusan</Text>
            <Text style={styles.infoValue}>{user.jurusan}</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Pengaturan Akun</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/edit-profile')}
        >
          <FontAwesome
            name='user'
            size={20}
            color={tintColor}
            style={styles.settingIcon}
          />
          <Text style={styles.settingText}>Edit Profil</Text>
          <FontAwesome name='chevron-right' size={14} color='#999' />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/change-password')}
        >
          <FontAwesome
            name='lock'
            size={20}
            color={tintColor}
            style={styles.settingIcon}
          />
          <Text style={styles.settingText}>Ubah Password</Text>
          <FontAwesome name='chevron-right' size={14} color='#999' />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome
            name='bell'
            size={20}
            color={tintColor}
            style={styles.settingIcon}
          />
          <Text style={styles.settingText}>Notifikasi</Text>
          <FontAwesome name='chevron-right' size={14} color='#999' />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sistem Absensi SMK Mastrip 1</Text>
        <Text style={styles.footerText}>Versi 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#2f95dc',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
    borderRadius: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2f95dc',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    marginTop: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    padding: 15,
    margin: 16,
    marginTop: 0,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
});
