import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { db } from '@/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { z } from 'zod';
import { EquipmentSchema, ListingSchema } from '@/utils/validators';

type EquipmentFromDB = z.infer<typeof EquipmentSchema>;
type ListingFromDB = z.infer<typeof ListingSchema>;

interface HydratedListing extends ListingFromDB {
  equipment: EquipmentFromDB;
  owner?: {
    name: string;
    profileImageUrl?: string;
    averageRating?: number;
    numberOfRatings?: number;
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
const ERROR_RED = '#DC2626';

const DEFAULT_OWNER_IMAGE = 'https://www.gravatar.com/avatar/?d=mp';
const NO_IMAGE_PLACEHOLDER =
  'https://placehold.co/100x70/E5E7EB/4B5563?text=No+Image';

export default function EquipmentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<HydratedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!id) {
        setLoading(false);
        setError('No listing ID provided.');
        return;
      }

      try {
        const listingDocRef = doc(db, 'listings', id);
        const listingSnap = await getDoc(listingDocRef);

        if (!listingSnap.exists()) {
          console.log('No such listing document!');
          setError('Equipment listing not found.');
          setLoading(false);
          return;
        }

        const listingData = ListingSchema.parse({
          ...listingSnap.data(),
          id: listingSnap.id,
        });

        const equipmentDocRef = doc(db, 'equipment', listingData.equipmentId);
        const equipmentSnap = await getDoc(equipmentDocRef);

        if (!equipmentSnap.exists()) {
          console.warn(`Equipment not found for listing ${listingData.id}`);
          setError('Associated equipment details not found.');
          setLoading(false);
          return;
        }

        const equipmentData = EquipmentSchema.parse({
          ...equipmentSnap.data(),
          id: equipmentSnap.id,
        });

        const hydratedListing: HydratedListing = {
          ...listingData,
          equipment: equipmentData,
          owner: {
            name: 'John Doe',
            profileImageUrl:
              'https://www.courtney.codes/assets/images/courtney.jpg',
            averageRating: 4.8,
            numberOfRatings: 14,
          },
        };

        setListing(hydratedListing);
      } catch (e) {
        console.error('Error fetching equipment details: ', e);
        setError('Failed to load equipment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id]);

  const handleBookingRequest = () => {
    if (listing) {
      router.push(`/booking/${listing.id}`);
    }
  };

  const handleContactOwner = () => {
    Alert.alert(
      'Contact Owner',
      `Would you like to contact ${listing?.owner?.name || 'the owner'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Owner', onPress: () => console.log('Call owner') },
        { text: 'Message Owner', onPress: () => console.log('Message owner') },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centeredMessageContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text style={styles.loadingText}>Loading equipment details...</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.centeredMessageContainer}>
        <MaterialIcons name="error-outline" size={50} color={ERROR_RED} />
        <Text style={styles.errorText}>{error || 'Equipment not found.'}</Text>
        <Button
          onPress={() => router.back()}
          text="Go Back"
          style={styles.goBackButton}
          textStyle={styles.actionButtonText}
        />
      </View>
    );
  }

  const { equipment, owner } = listing;

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
        <Text style={styles.headerTitle}>Equipment Details</Text>
        <View style={{ width: 24 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: equipment.images?.[0] || NO_IMAGE_PLACEHOLDER }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.name}>{equipment.name}</Text>
          <Text style={styles.carRating}>
            Equipment Rating: {equipment.rating?.toFixed(1) || 'N/A'}/5.0
          </Text>

          <View style={styles.section}>
            <View style={styles.ownerInfoContent}>
              <Image
                source={{
                  uri: owner?.profileImageUrl || DEFAULT_OWNER_IMAGE,
                }}
                style={styles.ownerImage}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>
                  {owner?.name || 'Equipment Owner'}
                </Text>
                <View style={styles.ownerRating}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.ratingText}>
                    {owner?.averageRating?.toFixed(1) || '0.0'} •{' '}
                    {owner?.numberOfRatings || 0} reviews
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleContactOwner}>
                <Text style={styles.contactOwnerText}>Contact Owner</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Technical specifications</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specsContainer}
          >
            {equipment.power && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{equipment.power}</Text>
                <Text style={styles.specLabel}>Power</Text>
              </View>
            )}
            {equipment.fuelType && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{equipment.fuelType}</Text>
                <Text style={styles.specLabel}>Fuel Type</Text>
              </View>
            )}
            {equipment.yearOfManufacture && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>
                  {equipment.yearOfManufacture}
                </Text>
                <Text style={styles.specLabel}>Year</Text>
              </View>
            )}
            {equipment.transmissionType && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>
                  {equipment.transmissionType}
                </Text>
                <Text style={styles.specLabel}>Transmission</Text>
              </View>
            )}
            {equipment.condition && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{equipment.condition}</Text>
                <Text style={styles.specLabel}>Condition</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {equipment.description || 'No description provided.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityList}>
              <Text style={styles.availabilityBullet}>
                • Available Now for immediate rental.
              </Text>
              <Text style={styles.availabilityBullet}>
                • Minimum 1 day rental period required.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceFooter}>
          <Text style={styles.priceFrom_bottomBar}>from</Text>
          <Text style={styles.price_bottomBar}>
            ${listing.price?.toFixed(2) || 'N/A'}
          </Text>
          <Text style={styles.priceUnit_bottomBar}> / day</Text>
        </View>
        <Button
          onPress={handleBookingRequest}
          text="Book Now"
          style={styles.bookNowButton}
          textStyle={styles.bookNowButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    padding: 24,
  },
  loadingText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    marginTop: 12,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 35 : 45,
    paddingBottom: 10,
    backgroundColor: MAIN_COLOR,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
  },
  backButton: {
    padding: 6,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  errorText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: ERROR_RED,
    marginBottom: 16,
  },
  goBackButton: {
    width: 140,
    backgroundColor: MAIN_COLOR,
  },
  actionButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: HEADER_TEXT_COLOR,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginTop: Platform.OS === 'android' ? 35 + 10 : 45 + 10,
    zIndex: -1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    marginTop: -BORDER_RADIUS,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER_GREY,
  },
  name: {
    fontFamily: 'Archivo-Bold',
    fontSize: 20,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
  },
  carRating: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 20,
  },
  ownerInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    paddingVertical: 0,
    borderColor: 'transparent',
  },
  ownerImage: {
    width: 45,
    height: 45,
    borderRadius: 10.5,
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    color: '#F59E0B',
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: TEXT_SECONDARY_GREY,
  },
  contactOwnerText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: MAIN_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 10,
    marginTop: 0,
  },
  specsContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  specItem: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  specValue: {
    fontFamily: 'Archivo-Bold',
    fontSize: 15,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 2,
  },
  specLabel: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: TEXT_SECONDARY_GREY,
  },
  section: {
    marginBottom: 16,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    padding: 12,
  },
  description: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
    lineHeight: 22,
  },
  availabilityList: {
    marginTop: 10,
    paddingHorizontal: 0,
  },
  availabilityBullet: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
    lineHeight: 20,
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
    borderTopLeftRadius: BORDER_RADIUS * 2,
    borderTopRightRadius: BORDER_RADIUS * 2,
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
  priceUnit_bottomBar: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: HEADER_TEXT_COLOR,
    marginLeft: 2,
  },
  bookNowButton: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BACKGROUND,
  },
  bookNowButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: MAIN_COLOR,
  },
});
