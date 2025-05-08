import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Settings, LogOut, MessageCircle, MapPin, Star, FileText, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'rentals' | 'listings'>('rentals');
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            logout();
            router.replace('/login');
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Not signed in</Text>
        <Button 
          text="Go to Login" 
          onPress={() => router.replace('/login')}
          style={styles.loginButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('@/assets/images/profile.png')}
            style={styles.profileImage}
          />
          
          <Text style={styles.name}>{currentUser.name}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>{currentUser.location || 'Location not set'}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color="#F59E0B" style={styles.starIcon} />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.ratingCount}>(12 reviews)</Text>
          </View>
          
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeText}>
              {currentUser.userType === 'farmer' ? 'Farmer (Renter)' : 'Equipment Owner'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color="#4D7C0F" />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile/settings')}>
            <Settings size={20} color="#4D7C0F" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <LogOut size={20} color="#4D7C0F" />
            <Text style={styles.actionText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'rentals' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('rentals')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'rentals' && styles.activeTabButtonText
          ]}>
            My Rentals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'listings' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'listings' && styles.activeTabButtonText
          ]}>
            My Listings
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContent}>
        {activeTab === 'rentals' ? (
          currentUser.rentals && currentUser.rentals.length > 0 ? (
            <Text>Rentals list will appear here</Text>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Clock size={40} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No rental history</Text>
              <Text style={styles.emptyStateText}>
                You haven't rented any equipment yet
              </Text>
              <Button 
                text="Browse Equipment" 
                onPress={() => router.push('/')}
                style={styles.browseButton}
              />
            </View>
          )
        ) : (
          currentUser.listings && currentUser.listings.length > 0 ? (
            <Text>Listings will appear here</Text>
          ) : (
            <View style={styles.emptyStateContainer}>
              <FileText size={40} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No listings yet</Text>
              <Text style={styles.emptyStateText}>
                You haven't listed any equipment for rent or sale
              </Text>
              <Button 
                text="Add Listing" 
                onPress={() => router.push('/add')}
                style={styles.browseButton}
              />
            </View>
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
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
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4B5563',
  },
  ratingCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  userTypeContainer: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  userTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4D7C0F',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#4D7C0F',
  },
  tabButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#4D7C0F',
  },
  tabContent: {
    flex: 1,
    padding: 16,
    minHeight: 300,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    width: 200,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 24,
  },
  loginButton: {
    marginTop: 16,
    alignSelf: 'center',
    width: 200,
  },
});