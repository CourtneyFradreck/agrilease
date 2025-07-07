import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const WARNING_COLOR = '#DC2626';

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        onPress: () => {
          logout();
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView style={styles.headerInner}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={HEADER_TEXT_COLOR} />
          </TouchableOpacity>
          <View style={styles.headerTextContent}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerDescription}>
              Manage your app preferences
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollViewContent}
        contentContainerStyle={styles.scrollViewContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/profile/edit')}
          >
            <View style={styles.settingItemContent}>
              <MaterialIcons
                name="person-outline"
                size={24}
                color={TEXT_PRIMARY_DARK}
              />
              <Text style={styles.settingItemText}>Edit Profile</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={TEXT_SECONDARY_GREY}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/profile/change-password')}
          >
            <View style={styles.settingItemContent}>
              <MaterialIcons
                name="lock-outline"
                size={24}
                color={TEXT_PRIMARY_DARK}
              />
              <Text style={styles.settingItemText}>Change Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={TEXT_SECONDARY_GREY}
            />
          </TouchableOpacity>
            <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/notifications')}
            >
            <View style={styles.settingItemContent}>
              <MaterialIcons
              name="notifications-none"
              size={24}
              color={TEXT_PRIMARY_DARK}
              />
              <Text style={styles.settingItemText}>Notifications</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={TEXT_SECONDARY_GREY}
            />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/privacy-policy')}
          >
            <View style={styles.settingItemContent}>
              <MaterialIcons
                name="privacy-tip"
                size={24}
                color={TEXT_PRIMARY_DARK}
              />
              <Text style={styles.settingItemText}>Privacy Policy</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={TEXT_SECONDARY_GREY}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/terms-of-service')}
          >
            <View style={styles.settingItemContent}>
              <MaterialIcons
                name="description"
                size={24}
                color={TEXT_PRIMARY_DARK}
              />
              <Text style={styles.settingItemText}>Terms of Service</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={TEXT_SECONDARY_GREY}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/about')}
          >
            <View style={styles.settingItemContent}>
              <MaterialIcons
                name="info-outline"
                size={24}
                color={TEXT_PRIMARY_DARK}
              />
              <Text style={styles.settingItemText}>About App</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={TEXT_SECONDARY_GREY}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color={WARNING_COLOR} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
  },
  header: {
    backgroundColor: MAIN_COLOR,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTextContent: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
    textAlign: 'left',
  },
  headerDescription: {
    fontFamily: 'Archivo-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    marginTop: 2,
  },
  scrollViewContent: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 85 : 95,
    backgroundColor: CARD_BACKGROUND,
  },
  scrollViewContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 70 : 65,
    paddingHorizontal: 18,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: BORDER_RADIUS,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: WARNING_COLOR,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  logoutButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: WARNING_COLOR,
    marginLeft: 10,
  },
});
