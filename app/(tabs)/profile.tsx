import React, { useState, useEffect } from 'react';
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

export default function Profile() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'rentals' | 'listings'>('rentals');

  const [myRentals, setMyRentals] = useState<HydratedBooking[]>([]);
  const [myListings, setMyListings] = useState<HydratedListing[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [rentalsError, setRentalsError] = useState<string | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const defaultProfileImage = 'https://www.gravatar.com/avatar/?d=mp';

  useEffect(() => {
    const fetchMyRentals = async () => {
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

            const equipmentDocRef = doc(
              db,
              'equipment',
              listingData.equipmentId,
            );
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
        setRentalsError('Failed to load rental history.');
      } finally {
        setLoadingRentals(false);
      }
    };
    fetchMyRentals();
  }, [currentUser?.id]);

  useEffect(() => {
    const fetchMyListings = async () => {
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
        setListingsError('Failed to load your listings.');
      } finally {
        setLoadingListings(false);
      }
    };
    fetchMyListings();
  }, [currentUser?.id]);

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

  const formatLocation = () => {
    const { location } = currentUser;
    if (!location) return 'Not set';

    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);

    return parts.length > 0 ? parts.join(', ') : 'Not set';
  };

  const getUserRoles = (userType: string) => {
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
    >
      <Image
        source={{
          uri:
            item.listing.equipment.images?.[0] ||
            'https://placehold.co/100x70/E5E7EB/4B5563?text=No+Image',
        }}
        style={styles.rentalImage}
      />
      <View style={styles.rentalDetails}>
        <Text style={styles.rentalEquipmentName}>
          {item.listing.equipment.name}
        </Text>
        <Text style={styles.rentalDates}>
          {new Date(item.startDate).toLocaleDateString()} -{' '}
          {new Date(item.endDate).toLocaleDateString()}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView style={styles.headerInner}>
          <View style={styles.headerTextContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerDescription}>
              Manage your account and listings
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerSettingsButton}
            onPress={() => router.push('/profile/settings')}
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
                uri: currentUser.profileImageUrl || defaultProfileImage,
              }}
              style={styles.profileImageLeft}
            />
            <View style={styles.userInfoRight}>
              <Text style={styles.name} numberOfLines={1}>
                {currentUser.name}
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
                  <View key={index} style={styles.userTypeBadge}>
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
          {activeTab === 'rentals' ? (
            loadingRentals ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={MAIN_COLOR} />
                <Text style={styles.loadingMessage}>
                  Loading your rentals...
                </Text>
              </View>
            ) : rentalsError ? (
              <View style={styles.errorState}>
                <Text style={styles.errorText}>{rentalsError}</Text>
              </View>
            ) : myRentals.length > 0 ? (
              <FlatList
                data={myRentals}
                renderItem={renderRentalItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
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
                  style={styles.actionButtonPrimary}
                  textStyle={styles.actionButtonPrimaryText}
                />
              </View>
            )
          ) : loadingListings ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={MAIN_COLOR} />
              <Text style={styles.loadingMessage}>
                Loading your listings...
              </Text>
            </View>
          ) : listingsError ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>{listingsError}</Text>
            </View>
          ) : myListings.length > 0 ? (
            <FlatList
              data={myListings}
              renderItem={({ item }) => (
                <ListingCard
                  listing={item}
                  onPress={() => router.push(`/listings/${item.id}`)}
                />
              )}
              numColumns={2}
              columnWrapperStyle={styles.listingRow}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
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
              {(currentUser.userType === 'equipmentOwner' ||
                currentUser.userType === 'both') && (
                <Button
                  text="Add Listing"
                  onPress={() => router.push('/add')}
                  style={styles.actionButtonPrimary}
                  textStyle={styles.actionButtonPrimaryText}
                />
              )}
            </View>
          )}
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
    paddingTop: 30,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  headerTextContent: {
    flex: 1,
    alignItems: 'flex-start',
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
  headerSettingsButton: {
    padding: 6,
  },
  scrollViewContent: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 85 : 95,
    marginTop: 20,
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
    padding: 0,
    backgroundColor: CARD_BACKGROUND,
  },
  profileInfoTopSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    padding: 0,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 0,
    borderWidth: 0,
  },
  profileImageLeft: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS,
    marginRight: 15,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  userInfoRight: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
    textAlign: 'left',
    flexShrink: 1,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
    flexWrap: 'wrap',
    flexShrink: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: TEXT_SECONDARY_GREY,
    marginRight: 5,
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: TEXT_PRIMARY_DARK,
    flexShrink: 1,
  },
  userTypeBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  userTypeBadgeText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 12,
    color: TEXT_PRIMARY_DARK,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    borderTopWidth: 0,
    paddingTop: 0,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  actionText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: TEXT_DARK_GREY,
    marginTop: 4,
    textAlign: 'center',
  },
  tabsSection: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginHorizontal: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GREY,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: MAIN_COLOR,
  },
  tabButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
  },
  tabButtonTextActive: {
    color: MAIN_COLOR,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 0,
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
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    marginTop: 10,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_DARK_GREY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButtonPrimary: {
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButtonPrimaryText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: HEADER_TEXT_COLOR,
  },
  errorText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: WARNING_COLOR,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    width: 200,
    backgroundColor: MAIN_COLOR,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    marginTop: 10,
  },
  loadingMessage: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    marginTop: 10,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    marginTop: 10,
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
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    marginBottom: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentalImage: {
    width: 90,
    height: 70,
    borderRadius: BORDER_RADIUS,
    marginRight: 12,
    resizeMode: 'cover',
  },
  rentalDetails: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rentalEquipmentName: {
    fontFamily: 'Archivo-Bold',
    fontSize: 17,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 2,
    textAlign: 'left',
  },
  rentalDates: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 2,
    textAlign: 'left',
  },
  rentalStatus: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: MAIN_COLOR,
    marginBottom: 2,
    textAlign: 'left',
  },
  rentalPrice: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    textAlign: 'left',
  },
});
