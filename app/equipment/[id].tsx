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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/Button';
import { db } from '@/FirebaseConfig';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const ERROR_RED = '#DC2626';

export default function EquipmentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [equipment, setEquipment] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        console.log(id);
        const docSnap = await getDoc(doc(db, 'listings', id));
        if (!docSnap.exists) {
          console.log('No such document!');
        } else {
          console.log('Document data:', docSnap.data());
        }
      } catch (error) {
        console.error(error);
      }
    })();

    console.log('hello');
  }, []);

  if (!equipment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Equipment not found</Text>
        <Button
          onPress={() => router.back()}
          text="Go Back"
          style={styles.goBackButton}
        />
      </View>
    );
  }

  const handleBookingRequest = () => {
    console.log(`/booking/${id}`);
    router.push(`/booking/${id}`);
  };

  const handleContactOwner = () => {
    Alert.alert(
      'Contact Owner',
      `Would you like to contact ${equipment.owner?.name || 'the owner'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Owner', onPress: () => console.log('Call owner') },
        { text: 'Message Owner', onPress: () => console.log('Message owner') },
      ],
    );
  };

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
            source={{ uri: equipment.image }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.name}>{equipment.name}</Text>
          <Text style={styles.carRating}>Equipment Rating: 92/100</Text>

          <View style={styles.section}>
            <View style={styles.ownerInfoContent}>
              <Image
                source={{
                  uri: 'https://www.courtney.codes/assets/images/courtney.jpg',
                }}
                style={styles.ownerImage}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>
                  {equipment.owner?.name || 'Equipment Owner'}
                </Text>
                <View style={styles.ownerRating}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.ratingText}>5.0 • 14 reviews</Text>
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
            <View style={styles.specItem}>
              <Text style={styles.specValue}>610 hp.</Text>
              <Text style={styles.specLabel}>Engine</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specValue}>3.2 s</Text>
              <Text style={styles.specLabel}>0-100 km/h</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specValue}>All-wheel</Text>
              <Text style={styles.specLabel}>Drive</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specValue}>Automatic</Text>
              <Text style={styles.specLabel}>Transmission</Text>
            </View>
          </ScrollView>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{equipment.description}</Text>
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
            ${equipment.rentalPrice?.toFixed(2)}
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
  },
  goBackButton: {
    width: 140,
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
    paddingHorizontal: 18,
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
