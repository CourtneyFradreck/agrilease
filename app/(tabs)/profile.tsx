import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '@/components/Button'; // Assuming your Button component is styled consistently internally

// --- Consistent Constants (ensure these match your global constants file) ---
const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const SLATE_LOCATION_COLOR = '#D1D5DB';
const TEXT_PRIMARY_DARK = '#1F2937'; // For main headings, bold text
const TEXT_SECONDARY_GREY = '#6B7280'; // For secondary text, descriptions
const BACKGROUND_LIGHT_GREY = '#F9FAFB'; // Overall page background
const CARD_BACKGROUND = '#FFFFFF'; // White for cards, header, tabs
const BORDER_GREY = '#E5E5E5'; // Light grey for borders and separators
const LIGHT_GREEN_BACKGROUND = '#F0FDF4'; // For accent backgrounds like user type badge
const TEXT_LIGHT_GREY = '#B0B0B0'; // For very light grey text (if needed)
const TEXT_DARK_GREY = '#4B5563'; // For rating text, action text
const WARNING_COLOR = '#DC2626'; // For error/destructive actions
const STAR_COLOR = '#F59E0B'; // For star ratings
const EMPTY_STATE_ICON_COLOR = '#9CA3AF'; // For empty state icons

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'rentals' | 'listings'>('rentals');

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

  if (!currentUser) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>You are not signed in.</Text>
        <Button
          text="Go to Login"
          onPress={() => router.replace('/login')}
          style={styles.loginButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* --- Header Section --- */}
      <View style={styles.header}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <Image
              source={require('@/assets/images/profile.png')}
              style={styles.profileImage}
            />

            <Text style={styles.name}>{currentUser.name}</Text>

            <View style={styles.locationContainer}>
              <MaterialIcons
                name="location-on"
                size={16}
                color={TEXT_SECONDARY_GREY}
              />
              <Text style={styles.locationText}>
                {currentUser.location || 'Location not set'}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <FontAwesome
                name="star"
                size={16}
                color={STAR_COLOR}
                style={styles.starIcon}
              />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.ratingCount}>(12 reviews)</Text>
            </View>

            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeText}>
                {currentUser.userType === 'farmer'
                  ? 'Farmer (Renter)'
                  : 'Equipment Owner'}
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="message" size={20} color={MAIN_COLOR} />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/profile/settings')}
            >
              <Ionicons name="settings" size={20} color={MAIN_COLOR} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={MAIN_COLOR} />
              <Text style={styles.actionText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* --- Tabs Container --- */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'rentals' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('rentals')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'rentals' && styles.activeTabButtonText,
            ]}
          >
            My Rentals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'listings' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('listings')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'listings' && styles.activeTabButtonText,
            ]}
          >
            My Listings
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Tab Content --- */}
      <View style={styles.tabContent}>
        {activeTab === 'rentals' ? (
          currentUser.rentals && currentUser.rentals.length > 0 ? (
            // Replace with actual rental list component/FlatList
            <Text style={styles.placeholderText}>
              Your rented equipment will appear here.
            </Text>
          ) : (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons
                name="access-time"
                size={40}
                color={EMPTY_STATE_ICON_COLOR}
              />
              <Text style={styles.emptyStateTitle}>No rental history</Text>
              <Text style={styles.emptyStateText}>
                You haven't rented any equipment yet.
              </Text>
              <Button
                text="Browse Equipment"
                onPress={() => router.push('/')}
                style={styles.actionButtons}
              />
            </View>
          )
        ) : currentUser.listings && currentUser.listings.length > 0 ? (
          // Replace with actual listings list component/FlatList
          <Text style={styles.placeholderText}>
            Your listed equipment will appear here.
          </Text>
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons
              name="description"
              size={40}
              color={EMPTY_STATE_ICON_COLOR}
            />
            <Text style={styles.emptyStateTitle}>No listings yet</Text>
            <Text style={styles.emptyStateText}>
              You haven't listed any equipment for rent or sale.
            </Text>
            <Button
              text="Add Listing"
              onPress={() => router.push('/add')}
              style={styles.actionButtons}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY, // Consistent background
  },
  centeredContainer: {
    // For when not logged in
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    padding: 24,
  },
  header: {
    backgroundColor: CARD_BACKGROUND, // Consistent card/header background
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GREY, // Consistent border color
  },
  headerSafeArea: {
    paddingTop: Platform.OS === 'android' ? 35 : 0, // Adjust for Android status bar, iOS handles it
    paddingHorizontal: 16, // Consistent horizontal padding
    paddingBottom: 24, // Padding below actions
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 16, // Space between user details and actions
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2, // Add a subtle border
    borderColor: BORDER_GREY,
  },
  name: {
    fontFamily: 'Archivo-Bold', // Consistent font
    fontSize: 24,
    color: TEXT_PRIMARY_DARK, // Consistent text color
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontFamily: 'Archivo-Regular', // Consistent font
    fontSize: 14,
    color: TEXT_SECONDARY_GREY, // Consistent text color
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontFamily: 'Archivo-Bold', // Consistent font
    fontSize: 14,
    color: TEXT_DARK_GREY, // Consistent text color
  },
  ratingCount: {
    fontFamily: 'Archivo-Regular', // Consistent font
    fontSize: 14,
    color: TEXT_SECONDARY_GREY, // Consistent text color
    marginLeft: 4,
  },
  userTypeContainer: {
    backgroundColor: LIGHT_GREEN_BACKGROUND, // Consistent background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  userTypeText: {
    fontFamily: 'Archivo-Medium', // Consistent font
    fontSize: 14,
    color: MAIN_COLOR, // Consistent text color
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16, // Space from content
    // paddingHorizontal already handled by headerSafeArea
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8, // Add padding for better touch target
    paddingHorizontal: 8,
  },
  actionText: {
    fontFamily: 'Archivo-Medium', // Consistent font
    fontSize: 13, // Slightly reduced for action text
    color: TEXT_DARK_GREY, // Consistent text color
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: CARD_BACKGROUND, // Consistent background
    marginTop: 16, // Space from header
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GREY, // Consistent border
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: MAIN_COLOR, // Consistent accent color
  },
  tabButtonText: {
    fontFamily: 'Archivo-Medium', // Consistent font
    fontSize: 16,
    color: TEXT_SECONDARY_GREY, // Consistent text color
  },
  activeTabButtonText: {
    color: MAIN_COLOR, // Consistent accent color
  },
  tabContent: {
    flex: 1,
    padding: 16, // Consistent padding
    minHeight: 300, // Ensure content area has a minimum height
  },
  placeholderText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold', // Consistent font
    fontSize: 18,
    color: TEXT_DARK_GREY, // Consistent text color
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular', // Consistent font
    fontSize: 16,
    color: TEXT_SECONDARY_GREY, // Consistent text color
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButtons: {
    // Renamed from browseButton for generality
    width: 200,
  },
  errorText: {
    fontFamily: 'Archivo-Regular', // Consistent font
    fontSize: 16,
    color: WARNING_COLOR, // Consistent warning color
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    width: 200,
  },
});
