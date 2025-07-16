import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  ImageSourcePropType,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { db } from '@/FirebaseConfig';
import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { z } from 'zod';
import {
  ListingSchema,
  EquipmentSchema,
  UserSchema,
  BookingSchema,
} from '@/utils/validators';

type DetailedBooking = z.infer<typeof BookingSchema> & {
  listing: z.infer<typeof ListingSchema> & {
    equipment: z.infer<typeof EquipmentSchema>;
    owner: Pick<
      z.infer<typeof UserSchema>,
      'name' | 'email' | 'profileImageUrl' | 'id' | 'averageRating' | 'numberOfRatings'
    >;
  };
};

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const BACKGROUND_WHITE = '#FFFFFF';
const BORDER_LIGHT = '#F1F5F9';
const ERROR_RED = '#DC2626';
const STATUS_PENDING = '#F59E0B';
const STATUS_APPROVED = '#10B981';
const STATUS_DENIED = '#EF4444';

export default function RentalDetails() {
  const { id: bookingId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detailedBooking, setDetailedBooking] =
    useState<DetailedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const defaultOwnerImage = 'https://www.gravatar.com/avatar/?d=mp';
  const defaultEquipmentImage =
    'https://placehold.co/400x250/E5E7EB/4B5563?text=No+Image+Available';

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('Booking ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const bookingDocRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingDocRef);

        if (!bookingSnap.exists()) {
          setError('Booking not found.');
          setLoading(false);
          return;
        }
        const bookingData = BookingSchema.parse({
          ...bookingSnap.data(),
          id: bookingSnap.id,
        });

        const listingDocRef = doc(db, 'listings', bookingData.listingId);
        const listingSnap = await getDoc(listingDocRef);

        if (!listingSnap.exists()) {
          setError('Associated listing not found.');
          setLoading(false);
          return;
        }
        const listingData = ListingSchema.parse({
          ...listingSnap.data(),
          id: listingSnap.id,
        });

        const equipmentDocRef = doc(db, `equipment`, listingData.equipmentId);
        const equipmentSnap = await getDoc(equipmentDocRef);

        if (!equipmentSnap.exists()) {
          setError('Associated equipment not found.');
          setLoading(false);
          return;
        }
        const equipmentData = EquipmentSchema.parse({
          ...equipmentSnap.data(),
          id: equipmentSnap.id,
        });

        const ownerDocRef = doc(db, `users`, listingData.ownerId);
        const ownerSnap = await getDoc(ownerDocRef);

        let ownerData: DetailedBooking['listing']['owner'] = {
          id: listingData.ownerId,
          name: 'Unknown User',
          email: '',
          profileImageUrl: defaultOwnerImage,
          numberOfRatings: 0,
          averageRating: 0,
        };

        if (ownerSnap.exists()) {
          const parsedOwnerData = UserSchema.parse(ownerSnap.data());
          ownerData = {
            id: ownerSnap.id,
            name: parsedOwnerData.name,
            email: parsedOwnerData.email,
            profileImageUrl:
              parsedOwnerData.profileImageUrl || defaultOwnerImage,
            numberOfRatings: parsedOwnerData.numberOfRatings,
            averageRating: parsedOwnerData.averageRating,
          };
        } else {
          console.warn(`Owner with ID ${listingData.ownerId} not found.`);
        }

        setDetailedBooking({
          ...bookingData,
          listing: {
            ...listingData,
            equipment: equipmentData,
            owner: ownerData,
          },
        });
      } catch (e) {
        console.error('Error fetching booking details: ', e);
        if (e instanceof z.ZodError) {
          setError(
            `Data validation error: ${e.errors.map((err) => err.message).join(', ')}`
          );
        } else {
          setError('Failed to load booking details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleContactOwner = () => {
    if (!detailedBooking?.listing.owner?.id) {
      Alert.alert('Owner not found', 'Could not retrieve owner information.');
      return;
    }
    router.push(`/messages/${detailedBooking.listing.owner.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (error || !detailedBooking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Booking not found.'}</Text>
        <Button
          onPress={() => router.back()}
          text="Go Back"
          style={styles.goBackButton}
        />
      </View>
    );
  }

  const { listing, status, totalPrice, startDate, endDate } = detailedBooking;
  const { equipment, owner } = listing;
  const imageUrl: ImageSourcePropType = {
    uri:
      (equipment.images && equipment.images.length > 0
        ? equipment.images[0]
        : defaultEquipmentImage) || defaultEquipmentImage,
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          backgroundColor: STATUS_APPROVED,
          color: HEADER_TEXT_COLOR,
        };
      case 'pending':
        return {
          backgroundColor: STATUS_PENDING,
          color: TEXT_PRIMARY_DARK,
        };
      case 'denied':
        return {
          backgroundColor: STATUS_DENIED,
          color: HEADER_TEXT_COLOR,
        };
      default:
        return {
          backgroundColor: BORDER_GREY,
          color: TEXT_PRIMARY_DARK,
        };
    }
  };
  const statusStyle = getStatusStyle(status);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back to previous screen"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={HEADER_TEXT_COLOR}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Rental Details</Text>
          <Text style={styles.headerDescription}>
            Review your rental information and status
          </Text>
        </View>
        <TouchableOpacity
            onPress={handleContactOwner}
            style={styles.headerContactButton}
            accessibilityLabel="Contact owner"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={HEADER_TEXT_COLOR}
            />
          </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={imageUrl} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.name}>{equipment.name}</Text>
          <Text style={styles.categoryType}>{equipment.type}</Text>

          {/* Owner Info Section */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push({ pathname: "/profile/[id]", params: { id: owner.id } })}
            style={styles.ownerCard}
          >
            <View style={styles.ownerInfoContent}>
              <Image
                source={{ uri: owner.profileImageUrl || defaultOwnerImage }}
                style={styles.ownerImage}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{owner.name}</Text>
                <View style={styles.ownerRating}>
                  <Text style={styles.ratingText}>
                    {owner.averageRating
                      ? `Rating: ${owner.averageRating.toFixed(1)}`
                      : 'No ratings yet'}
                  </Text>
                  <Text style={styles.ratingText}>
                    {owner.numberOfRatings
                      ? `Reviews: ${owner.numberOfRatings}`
                      : ''}
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={TEXT_SECONDARY_GREY}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Key Specifications</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specsContainer}
          >
            {equipment.yearOfManufacture && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>
                  {equipment.yearOfManufacture}
                </Text>
                <Text style={styles.specLabel}>Year</Text>
              </View>
            )}
            {equipment.make && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{equipment.make}</Text>
                <Text style={styles.specLabel}>Make</Text>
              </View>
            )}
            {equipment.model && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{equipment.model}</Text>
                <Text style={styles.specLabel}>Model</Text>
              </View>
            )}
            {equipment.condition && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{equipment.condition}</Text>
                <Text style={styles.specLabel}>Condition</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.description}>{equipment.description}</Text>

          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
          </View>
          <View style={styles.availabilityList}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Start Date:</Text>
              <Text style={styles.tableValue}>
                {formatDate(startDate)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>End Date:</Text>
              <Text style={styles.tableValue}>
                {formatDate(endDate)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceFooter}>
          <Text style={styles.priceFrom_bottomBar}>Total Price</Text>
          <Text style={styles.price_bottomBar}>${totalPrice.toFixed(2)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  loadingText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 90, 
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 30, 
    paddingBottom: 10,
    backgroundColor: MAIN_COLOR,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerTitleContainer: {
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
  headerContactButton: {
    padding: 6,
    marginLeft: 10,
  },
  backButton: {
    padding: 6,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  errorText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: ERROR_RED,
    marginBottom: 16,
    textAlign: 'center',
  },
  goBackButton: {
    width: 140,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginTop: Platform.OS === 'android' ? 20 + 30 + 10 : 30 + 30 + 10, 
    zIndex: -1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: CARD_BACKGROUND,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    marginTop: -BORDER_RADIUS,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderBottomWidth: 0,
  },
  name: {
    fontFamily: 'Archivo-Bold',
    fontSize: 24,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
    textAlign: 'left',
  },
  categoryType: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 16,
    textAlign: 'left',
  },
  ownerCard: {
    backgroundColor: BACKGROUND_WHITE,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    padding: 16,
    marginBottom: 20,
  },
  ownerInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerImage: {
    width: 48,
    height: 48,
    borderRadius: 15,
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
    alignItems: 'flex-start',
  },
  ownerName: {
    fontFamily: 'Archivo-Medium',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    textAlign: 'left',
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'left',
  },
  sectionTitleContainer: {
    marginTop: 5,
  },
  sectionTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    textAlign: 'left',
    marginBottom: 4,
  },
  specsContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
    marginBottom: 16,
  },
  specItem: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  specValue: {
    fontFamily: 'Archivo-Bold',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 2,
    textAlign: 'left',
  },
  specLabel: {
    fontFamily: 'Archivo-Regular',
    fontSize: 11,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'left',
  },
  description: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'left',
  },
  availabilityList: {
    marginTop: 0,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  tableLabel: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    flex: 1,
    textAlign: 'left',
  },
  tableValue: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    flex: 1,
    textAlign: 'right',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MAIN_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    borderTopWidth: 1,
    borderColor: MAIN_COLOR,
  },
  priceFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceFrom_bottomBar: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: HEADER_TEXT_COLOR,
    marginRight: 3,
  },
  price_bottomBar: {
    fontFamily: 'Archivo-Bold',
    fontSize: 24,
    color: HEADER_TEXT_COLOR,
  },
  statusBadge: {
    borderRadius: BORDER_RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
  },
});
