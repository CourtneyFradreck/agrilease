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
  Dimensions,
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

const { width } = Dimensions.get('window');
const SPEC_ITEM_MARGIN = 8; // Margin between grid items
const NUM_COLUMNS = 2; // Number of columns in the specifications grid

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

        const ownerDetails = {
          name: 'John Doe',
          profileImageUrl:
            'https://www.courtney.codes/assets/images/courtney.jpg',
          averageRating: 4.8,
          numberOfRatings: 14,
        };

        const hydratedListing: HydratedListing = {
          ...listingData,
          equipment: equipmentData,
          owner: ownerDetails,
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

  // Prepare specifications for grid display
  const specifications = [
    { label: 'Power', value: equipment.power },
    { label: 'Fuel Type', value: equipment.fuelType },
    { label: 'Year', value: equipment.yearOfManufacture },
    { label: 'Transmission', value: equipment.transmissionType },
    { label: 'Condition', value: equipment.condition },
    { label: 'Make', value: equipment.make },
    { label: 'Model', value: equipment.model },
    { label: 'Type', value: equipment.type },
  ].filter((spec) => spec.value); // Filter out specs without a value

  // Calculate item width for grid
  const itemWidth =
    (width -
      styles.contentCard.paddingHorizontal * 2 -
      SPEC_ITEM_MARGIN * (NUM_COLUMNS - 1)) /
    NUM_COLUMNS;

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
          {equipment.rating !== undefined && (
            <Text style={styles.equipmentRating}>
              Equipment Rating: {equipment.rating?.toFixed(1) || 'N/A'}/5.0
            </Text>
          )}

          <View style={[styles.section, styles.ownerInfoCard]}>
            <Text style={styles.sectionTitle}>Listed by</Text>
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
              <Button
                onPress={handleContactOwner}
                text="Contact"
                style={styles.contactOwnerButton}
                textStyle={styles.contactOwnerButtonText}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Specifications</Text>
            <View style={styles.specsGrid}>
              {specifications.map((spec, index) => (
                <View
                  key={index}
                  style={[styles.specItem, { width: itemWidth }]}
                >
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

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
          <Text style={styles.priceFrom_bottomBar}>
            {listing.listingType === 'rent' ? 'from' : 'Price'}
          </Text>
          <Text style={styles.price_bottomBar}>
            ${listing.price?.toFixed(2) || 'N/A'}
          </Text>
          {listing.listingType === 'rent' && (
            <Text style={styles.priceUnit_bottomBar}>
              /{listing.rentalUnit || 'day'}
            </Text>
          )}
        </View>
        <Button
          onPress={handleBookingRequest}
          text={listing.listingType === 'rent' ? 'Book Now' : 'Make Offer'}
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
    paddingBottom: 110, // Increased padding to accommodate larger bottom bar and ensure content isn't cut off
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
    marginBottom: 12, // Added spacing below image
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    // Removed marginTop: -BORDER_RADIUS to prevent content overlap with image
    paddingHorizontal: 18,
    paddingVertical: 18,
    // Removed top borders as the card starts below the image now
  },
  name: {
    fontFamily: 'Archivo-Bold',
    fontSize: 24, // Slightly larger font for name
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8, // Increased spacing
  },
  equipmentRating: {
    // Renamed from carRating for clarity
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 16, // Increased spacing
  },
  ownerInfoCard: {
    // New style for the owner section container
    paddingVertical: 16, // Increased padding
    marginBottom: 24, // Increased spacing
  },
  ownerInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerImage: {
    width: 60, // Larger image
    height: 60, // Larger image
    borderRadius: 30, // Make it perfectly circular
    marginRight: 16, // Increased spacing
    borderWidth: 2, // Thicker border
    borderColor: BORDER_GREY,
  },
  ownerDetails: {
    flex: 1,
    marginRight: 10, // Added margin for button
  },
  ownerName: {
    fontFamily: 'Archivo-Bold', // Make owner name bold
    fontSize: 18, // Larger font
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    color: '#F59E0B',
    fontSize: 16, // Slightly larger star
    marginRight: 4,
  },
  ratingText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14, // Slightly larger rating text
    color: TEXT_SECONDARY_GREY,
  },
  contactOwnerButton: {
    // Style for the contact button within the owner card
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  contactOwnerButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: HEADER_TEXT_COLOR,
  },
  sectionTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18, // Larger section titles
    color: TEXT_PRIMARY_DARK,
    marginBottom: 12, // Increased spacing
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16, // Spacing below the grid
  },
  specItem: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 12, // Adjusted padding
    paddingVertical: 10,
    marginBottom: SPEC_ITEM_MARGIN, // Spacing between rows
    borderWidth: 1,
    borderColor: BORDER_GREY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specValue: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16, // Larger spec value
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4, // Spacing between value and label
  },
  specLabel: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13, // Larger spec label
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24, // Increased spacing between sections
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    padding: 16, // Increased padding within sections
  },
  description: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
    lineHeight: 24, // Increased line height for readability
  },
  availabilityList: {
    marginTop: 10,
    paddingHorizontal: 0,
  },
  availabilityBullet: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 6, // Slightly reduced margin for tighter list
    lineHeight: 22, // Adjusted line height
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
    paddingVertical: 18, // Increased vertical padding
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
    fontSize: 14, // Slightly larger
    color: HEADER_TEXT_COLOR,
    marginRight: 4, // Increased margin
  },
  price_bottomBar: {
    fontFamily: 'Archivo-Bold',
    fontSize: 26, // Larger price
    color: HEADER_TEXT_COLOR,
  },
  priceUnit_bottomBar: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14, // Slightly larger
    color: HEADER_TEXT_COLOR,
    marginLeft: 4, // Increased margin
  },
  bookNowButton: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 14, // Increased vertical padding
    paddingHorizontal: 28, // Increased horizontal padding
    minWidth: 130, // Increased min-width
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BACKGROUND,
  },
  bookNowButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 17, // Slightly larger font
    color: MAIN_COLOR,
  },
});
