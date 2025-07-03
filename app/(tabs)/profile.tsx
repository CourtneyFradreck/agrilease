import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { db } from '@/FirebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { z } from 'zod';
import {
  EquipmentSchema,
  ListingSchema,
  BookingSchema,
} from '@/utils/validators';
import { ListingCard } from '@/components/ListingCard';
import { imagepicker } from 'expo';
import * from firebase as 'firebase';

type EquipmentFromDB = z.infer<typeof EquipmentSchema>;
type ListingFromDB = z.infer<typeof ListingSchema>;
type BookingFromDB = z.infer<typeof BookingSchema>;

interface HydratedEquipment extends EquipmentFromDB {
  rating?: number;
  yearOfManufacture?: z.infer<typeof EquipmentSchema>['yearOfManufacture'];
}

interface HydratedListing extends ListingFromDB {
  equipment: HydratedEquipment;
}

interface HydratedBooking extends BookingFromDB {
  listing: ListingFromDB & {
    equipment: EquipmentFromDB;
  };
}

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const TEXT_DARK_GREY = '#4B5563';
const WARNING_COLOR = '#DC2626';
const EMPTY_STATE_ICON_COLOR = '#9CA3AF';
const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/?d=mp';
const NO_IMAGE_PLACEHOLDER =
  'https://placehold.co/100x70/E5E7EB/4B5563?text=No+Image';

export default function Profile() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'rentals' | 'listings'>('rentals');

  const [myRentals, setMyRentals] = useState<HydratedBooking[]>([]);
  const [myListings, setMyListings] = useState<HydratedListing[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [rentalsError, setRentalsError] = useState<string | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const fetchMyRentals = useCallback(async () => {
    if (!currentUser?.id) {
      setLoadingRentals(false);
      return;
    }
    setLoadingRentals(true);
    setRentalsError(null);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('renterId', '==', currentUser.id),
      );
      const querySnapshot = await getDocs(q);
      const fetchedBookings: HydratedBooking[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const bookingData = BookingSchema.parse({
          ...docSnapshot.data(),
          id: docSnapshot.id,
        });

        const listingDocRef = doc(db, 'listings', bookingData.listingId);
        const listingSnap = await getDoc(listingDocRef);

        if (listingSnap.exists()) {
          const listingData = ListingSchema.parse({
            ...listingSnap.data(),
            id: listingSnap.id,
          });

          const equipmentDocRef = doc(db, 'equipment', listingData.equipmentId);
          const equipmentSnap = await getDoc(equipmentDocRef);

          if (equipmentSnap.exists()) {
            const equipmentData = EquipmentSchema.parse({
              ...equipmentSnap.data(),
              id: equipmentSnap.id,
            });
            fetchedBookings.push({
              ...bookingData,
              listing: { ...listingData, equipment: equipmentData }, 
            });
          } else {
            console.warn(
              `Equipment not found for listing ${listingData.id} in booking ${bookingData.id}`,
            );
          }
        } else {
          console.warn(`Listing not found for booking ${bookingData.id}`);
        }
      }
      setMyRentals(fetchedBookings);
    } catch (e) {
      console.error('Error fetching rentals: ', e);
      setRentalsError('Failed to load rental history. Please try again.');
    } finally {
      setLoadingRentals(false);
    }
  }, [currentUser?.id]);

  const fetchMyListings = useCallback(async () => {
    if (!currentUser?.id) {
      setLoadingListings(false);
      return;
    }
    setLoadingListings(true);
    setListingsError(null);
    try {
      const q = query(
        collection(db, 'listings'),
        where('ownerId', '==', currentUser.id),
      );
      const querySnapshot = await getDocs(q);
      const fetchedListings: HydratedListing[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const listingData = ListingSchema.parse({
          ...docSnapshot.data(),
          id: docSnapshot.id,
        });

        const equipmentDocRef = doc(db, 'equipment', listingData.equipmentId);
        const equipmentSnap = await getDoc(equipmentDocRef);

        if (equipmentSnap.exists()) {
          const equipmentData = EquipmentSchema.parse({
            ...equipmentSnap.data(),
            id: equipmentSnap.id,
          });
          fetchedListings.push({
            ...listingData,
            equipment: {
              ...equipmentData,
              rating: 4.8,
              condition: equipmentData.condition || undefined,
              yearOfManufacture: equipmentData.yearOfManufacture || undefined,
            },
          });
        } else {
          console.warn(`Equipment not found for listing ${listingData.id}`);
        }
      }
      setMyListings(fetchedListings);
    } catch (e) {
      console.error('Error fetching listings: ', e);
      setListingsError('Failed to load your listings. Please try again.');
    } finally {
      setLoadingListings(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchMyRentals();
  }, [fetchMyRentals]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  //image upload handling

  const chooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri, "profile_image");
    }
  };

  //uploading the image to firebase

  const uploadImage = async (uri: string, imageName: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = firebase.storage().ref().child("profile_images/" + imageName);
    return ref.put(blob)
      .then(() => {
        Alert.alert("Successfully uploaded");
      })
      .catch((error) => {
        Alert.alert(error.message);
      });
  };


  if (!currentUser) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="lock" size={50} color={EMPTY_STATE_ICON_COLOR} />
        <Text style={styles.errorText}>You are not signed in.</Text>
        <Button
          text="Go to Login"
          onPress={() => router.replace('/login')}
          style={styles.loginButton}
          textStyle={styles.actionButtonPrimaryText}
        />
      </View>
    );
  }

  const formatLocation = (): string => {
    const { location } = currentUser;
    if (!location) return 'Not set';

    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);

    return parts.length > 0 ? parts.join(', ') : 'Not set';
  };

  const getUserRoles = (
    userType: string,
  ): Array<{ name: string; icon: string }> => {
    const roles = [];
    if (userType === 'farmer' || userType === 'both') {
      roles.push({ name: 'Farmer', icon: 'agriculture' });
    }
    if (userType === 'equipmentOwner' || userType === 'both') {
      roles.push({ name: 'Owner', icon: 'build' });
    }
    if (roles.length === 0) {
      roles.push({ name: 'User', icon: 'person' });
    }
    return roles;
  };

  const renderRentalItem = ({ item }: { item: HydratedBooking }) => (
    <TouchableOpacity
      style={styles.rentalItemContainer}
      onPress={() => router.push(`/booking/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: item.listing.equipment.images?.[0] || NO_IMAGE_PLACEHOLDER,
        }}
        style={styles.rentalImage}
      />
      <View style={styles.rentalDetails}>
        <Text style={styles.rentalEquipmentName} numberOfLines={1}>
          {item.listing.equipment.name}
        </Text>
        <Text style={styles.rentalDates}>
          {new Date(item.startDate.toDate()).toLocaleDateString()} -{' '}
          {new Date(item.endDate.toDate()).toLocaleDateString()}
        </Text>
        <Text style={styles.rentalStatus}>
          Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
        <Text style={styles.rentalPrice}>
          Total: ${item.totalPrice.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRentalsTabContent = () => {
    if (loadingRentals) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
          <Text style={styles.loadingMessage}>
            Loading your rental history...
          </Text>
        </View>
      );
    }

    if (rentalsError) {
      return (
        <View style={styles.errorState}>
          <MaterialIcons name="error-outline" size={40} color={WARNING_COLOR} />
          <Text style={styles.errorText}>{rentalsError}</Text>
          <Button
            text="Retry"
            onPress={fetchMyRentals}
            style={styles.actionButtonPrimary}
            textStyle={styles.actionButtonPrimaryText}
          />
        </View>
      );
    }

    if (myRentals.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons
            name="access-time"
            size={40}
            color={EMPTY_STATE_ICON_COLOR}
          />
          <Text style={styles.emptyStateTitle}>No rental history</Text>
          <Text style={styles.emptyStateText}>
            You haven't rented any equipment yet. Start exploring!
          </Text>
          <Button
            text="Browse Equipment"
            onPress={() => router.push('/')}
            style={styles.actionButtonPrimary}
            textStyle={styles.actionButtonPrimaryText}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={myRentals}
        renderItem={renderRentalItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    );
  };

  const renderListingsTabContent = () => {
    if (loadingListings) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
          <Text style={styles.loadingMessage}>Loading your listings...</Text>
        </View>
      );
    }

    if (listingsError) {
      return (
        <View style={styles.errorState}>
          <MaterialIcons name="error-outline" size={40} color={WARNING_COLOR} />
          <Text style={styles.errorText}>{listingsError}</Text>
          <Button
            text="Retry"
            onPress={fetchMyListings}
            style={styles.actionButtonPrimary}
            textStyle={styles.actionButtonPrimaryText}
          />
        </View>
      );
    }

    if (myListings.length === 0) {
      return (
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
          {(currentUser.userType === 'equipmentOwner' ||
            currentUser.userType === 'both') && (
            <Button
              text="Add New Listing"
              onPress={() => router.push('/add')}
              style={styles.actionButtonPrimary}
              textStyle={styles.actionButtonPrimaryText}
            />
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={myListings}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => router.push(`/listings/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id!}
        numColumns={2}
        columnWrapperStyle={styles.listingRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView style={styles.headerInner}>
          <View style={styles.headerTextContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerDescription}>
              Manage your account and equipment
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerSettingsButton}
            onPress={() => router.push('/profile/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings" size={24} color={HEADER_TEXT_COLOR} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <View style={styles.profileSummarySection}>
          <View style={styles.profileInfoTopSection}>
            <Image
              source={{
                uri: currentUser.profileImageUrl || DEFAULT_PROFILE_IMAGE,
              }}
              style={styles.profileImageLeft}
            />
            <View style={styles.userInfoRight}>
              <Text style={styles.name} numberOfLines={1}>
                {currentUser.name || 'User Name'}
              </Text>

              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {formatLocation()}
                </Text>
              </View>

              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Rating:</Text>
                <Text style={styles.infoValue}>
                  {currentUser.averageRating?.toFixed(1) || '0.0'}
                </Text>
              </View>
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Reviews:</Text>
                <Text style={styles.infoValue}>
                  {currentUser.numberOfRatings || 0}
                </Text>
              </View>

              <View style={styles.userTypeBadgesContainer}>
                {getUserRoles(currentUser.userType).map((role, index) => (
                  <View
                    key={`${role.name}-${index}`}
                    style={styles.userTypeBadge}
                  >
                    <MaterialIcons
                      name={role.icon as any}
                      size={14}
                      color={MAIN_COLOR}
                    />
                    <Text style={styles.userTypeBadgeText}>{role.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Button
            text="Choose Image"
            onPress={chooseImage}
            style={styles.actionButtonPrimary}
            textStyle={styles.actionButtonPrimaryText}
          />
        </View>

        <View style={styles.tabsSection}>
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
                activeTab === 'rentals' && styles.tabButtonTextActive,
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
                activeTab === 'listings' && styles.tabButtonTextActive,
              ]}
            >
              My Listings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'rentals'
            ? renderRentalsTabContent()
            : renderListingsTabContent()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    padding: 20,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 45 : 60,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  headerTextContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 20,
    color: HEADER_TEXT_COLOR,
    textAlign: 'left',
  },
  headerDescription: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    marginTop: 2,
  },
  headerSettingsButton: {
    padding: 8,
  },
  scrollViewContent: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 120 : 130,
    backgroundColor: CARD_BACKGROUND,
  },
  scrollViewContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 90 : 85,
    flexGrow: 1,
  },
  profileSummarySection: {
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  profileInfoTopSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 0,
    backgroundColor: CARD_BACKGROUND,
  },
  profileImageLeft: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS + 4,
    marginRight: 18,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    resizeMode: 'cover',
  },
  userInfoRight: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 6,
    textAlign: 'left',
    flexShrink: 1,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    flexShrink: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginRight: 6,
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    flexShrink: 1,
  },
  userTypeBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  userTypeBadgeText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: TEXT_PRIMARY_DARK,
    marginLeft: 6,
  },
  tabsSection: {
    flexDirection: 'row',
    backgroundColor: CARD_BACKGROUND,
    marginHorizontal: 18,
    marginTop: 10,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 0,
    backgroundColor: CARD_BACKGROUND,
  },
  activeTabButton: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderBottomWidth: 3,
    borderBottomColor: MAIN_COLOR,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tabButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
  },
  tabButtonTextActive: {
    color: MAIN_COLOR,
    fontFamily: 'Archivo-Bold',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 15,
    minHeight: 300,
    backgroundColor: CARD_BACKGROUND,
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
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    marginTop: 15,
    minHeight: 250,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 19,
    color: TEXT_DARK_GREY,
    marginTop: 18,
    marginBottom: 10,
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  actionButtonPrimary: {
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  actionButtonPrimaryText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 17,
    color: HEADER_TEXT_COLOR,
  },
  errorText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: WARNING_COLOR,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  loginButton: {
    width: 220,
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 14,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    marginTop: 15,
  },
  loadingMessage: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    marginTop: 12,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    marginTop: 15,
  },
  listContent: {
    paddingVertical: 5,
  },
  listingRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  rentalItemContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    marginBottom: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  rentalImage: {
    width: 90,
    height: 70,
    borderRadius: BORDER_RADIUS - 2,
    marginRight: 12,
    resizeMode: 'cover',
    borderWidth: 0.5,
    borderColor: BORDER_GREY,
  },
  rentalDetails: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rentalEquipmentName: {
    fontFamily: 'Archivo-Bold',
    fontSize: 17,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
    textAlign: 'left',
  },
  rentalDates: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 4,
    textAlign: 'left',
  },
  rentalStatus: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: MAIN_COLOR,
    marginBottom: 4,
    textAlign: 'left',
  },
  rentalPrice: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    textAlign: 'left',
  },
});
