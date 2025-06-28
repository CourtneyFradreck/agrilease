import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { FilterModal } from '@/components/FilterModal';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';

const LIGHT_GREEN_BACKGROUND = '#F0FDF4';

const mapStyleJson = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f5f5',
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#f5f5f5',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#bdbdbd',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ffffff',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dadada',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#c9c9c9',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
];

const mockClients = [
  {
    id: 'client1',
    name: 'AgriSolutions Inc.',
    equipment: 'Large Tractor',
    contact: '+263 771 234 567',
    image: 'https://via.placeholder.com/150/4D7C0F/FFFFFF?text=Tractor',
    coordinate: {
      latitude: -17.7565,
      longitude: 31.0621,
    },
  },
  {
    id: 'client2',
    name: 'Farm Innovations',
    equipment: 'Harvester',
    contact: '+263 772 345 678',
    image: 'https://via.placeholder.com/150/4D7C0F/FFFFFF?text=Harvester',
    coordinate: {
      latitude: -17.892,
      longitude: 31.105,
    },
  },
  {
    id: 'client3',
    name: 'Green Fields Co.',
    equipment: 'Irrigation Pump',
    contact: '+263 773 456 789',
    image: 'https://via.placeholder.com/150/4D7C0F/FFFFFF?text=Pump',
    coordinate: {
      latitude: -17.82,
      longitude: 31.02,
    },
  },
  {
    id: 'client4',
    name: 'Rural Leasing',
    equipment: 'Seeder Machine',
    contact: '+263 774 567 890',
    image: 'https://via.placeholder.com/150/4D7C0F/FFFFFF?text=Seeder',
    coordinate: {
      latitude: -17.85,
      longitude: 30.98,
    },
  },
  {
    id: 'client5',
    name: 'Harvest Pros',
    equipment: 'Cultivator',
    contact: '+263 775 678 901',
    image: 'https://via.placeholder.com/150/4D7C0F/FFFFFF?text=Cultivator',
    coordinate: {
      latitude: -17.8,
      longitude: 31.08,
    },
  },
];

const mockNearbyEquipment = [
  {
    id: 'eq1',
    name: 'John Deere 6100R',
    type: 'Tractor',
    rentalPrice: 150,
    image: 'https://via.placeholder.com/200x120/82B13F/FFFFFF?text=Tractor+JD',
    rating: 4.8,
    reviews: 120,
  },
  {
    id: 'eq2',
    name: 'Claas Lexion 770',
    type: 'Harvester',
    rentalPrice: 300,
    image:
      'https://via.placeholder.com/200x120/A8A83A/FFFFFF?text=Harvester+Claas',
    rating: 4.5,
    reviews: 85,
  },
  {
    id: 'eq3',
    name: 'Krone Big M',
    type: 'Mower',
    rentalPrice: 90,
    image: 'https://via.placeholder.com/200x120/4D7C0F/FFFFFF?text=Mower+Krone',
    rating: 4.9,
    reviews: 210,
  },
  {
    id: 'eq4',
    name: 'Horsch Maestro',
    type: 'Seeder',
    rentalPrice: 180,
    image:
      'https://via.placeholder.com/200x120/6AA64E/FFFFFF?text=Seeder+Horsch',
    rating: 4.7,
    reviews: 95,
  },
  {
    id: 'eq5',
    name: 'Case IH Patriot',
    type: 'Sprayer',
    rentalPrice: 120,
    image:
      'https://via.placeholder.com/200x120/4D7C0F/FFFFFF?text=Sprayer+Case',
    rating: 4.6,
    reviews: 150,
  },
];

export default function Discover() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [mapIsInteracting, setMapIsInteracting] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: -17.825166, // Default fallback
    longitude: 31.03351,  // Default fallback
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [loadingLocation, setLoadingLocation] = useState(true);

  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animatedTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (
            userData.location &&
            typeof userData.location.latitude === 'number' &&
            typeof userData.location.longitude === 'number'
          ) {
            setMapRegion((prev) => ({
              ...prev,
              latitude: userData.location.latitude,
              longitude: userData.location.longitude,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      } finally {
        setLoadingLocation(false);
      }
    };
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (mapIsInteracting) {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 50, // Slide down by 50 units
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 0,
          duration: 300,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mapIsInteracting]);

  const filteredClientsForMap = searchQuery
    ? mockClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.equipment.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockClients;

  const filteredNearbyEquipment = searchQuery
    ? mockNearbyEquipment.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockNearbyEquipment;

  if (loadingLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        customMapStyle={mapStyleJson}
        onRegionChange={() => setMapIsInteracting(true)}
        onRegionChangeComplete={() => setMapIsInteracting(false)}
      >
        {filteredClientsForMap.map((client) => (
          <Marker
            key={client.id}
            coordinate={client.coordinate}
            title={client.name}
            description={client.equipment}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{client.name}</Text>
                <Text style={styles.calloutDescription}>
                  {client.equipment}
                </Text>
                <Text style={styles.calloutContact}>{client.contact}</Text>
                <Image
                  source={{ uri: client.image }}
                  style={styles.calloutImage}
                />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.searchAndFilterRow}>
          <View style={styles.searchInputWrapper}>
            <Feather
              name="search"
              size={20}
              color={TEXT_SECONDARY_GREY}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search equipment..."
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterModalVisible(true)}
            accessibilityLabel="Open filter options"
            activeOpacity={0.7}
          >
            <Feather name="sliders" size={22} color={MAIN_COLOR} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Animated.View
        style={[
          styles.availableEquipmentContainer,
          {
            opacity: animatedOpacity,
            transform: [{ translateY: animatedTranslateY }],
            pointerEvents: mapIsInteracting ? 'none' : 'auto',
          },
        ]}
      >
        {!mapIsInteracting && (
          <>
            <Text style={styles.availableTitle}>
              Available Equipment Near You
            </Text>
            <Text style={styles.availableDescription}>
              Explore a wide range of agricultural machinery available for rent
              in your vicinity.
            </Text>
            {filteredNearbyEquipment.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.availableListContent}
              >
                {filteredNearbyEquipment.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.equipmentCard}
                    onPress={() => {
                      router.push(`/equipment/${item.id}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.equipmentImage}
                      resizeMode="cover"
                    />
                    <View style={styles.equipmentDetails}>
                      <Text style={styles.equipmentName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.equipmentType}>{item.type}</Text>
                      <Text style={styles.equipmentPrice}>
                        ${item.rentalPrice?.toFixed(0)}
                        <Text style={styles.equipmentPriceUnit}>/day</Text>
                      </Text>
                      <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.bookNowButton}>
                          <Text style={styles.bookNowButtonText}>Book Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.detailsButton}
                          onPress={() => router.push(`/equipment/${item.id}`)}
                        >
                          <Text style={styles.detailsButtonText}>Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateTitle}>No equipment found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search criteria or check back later.
                </Text>
              </View>
            )}
          </>
        )}
      </Animated.View>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Header background will be transparent over map
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 18,
    paddingBottom: 10,
    zIndex: 10,
  },
  searchAndFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // Changed to transparent
    borderRadius: BORDER_RADIUS * 2,
    padding: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 14,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    fontFamily: 'Archivo-Regular',
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    borderRadius: BORDER_RADIUS,
    backgroundColor: CARD_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: BORDER_GREY,
    borderWidth: 1,
  },
  calloutTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 2,
    textAlign: 'center',
  },
  calloutDescription: {
    fontFamily: 'Archivo-Medium',
    fontSize: 12,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 5,
    textAlign: 'center',
  },
  calloutContact: {
    fontFamily: 'Archivo-Regular',
    fontSize: 11,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 5,
    textAlign: 'center',
  },
  calloutImage: {
    width: '100%',
    height: 60,
    borderRadius: BORDER_RADIUS / 2,
    resizeMode: 'cover',
    marginTop: 5,
  },
  availableEquipmentContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 70 : 65,
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderTopLeftRadius: BORDER_RADIUS * 2,
    borderTopRightRadius: BORDER_RADIUS * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  availableTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 20,
    color: TEXT_PRIMARY_DARK,
    paddingHorizontal: 18,
    paddingTop: 18,
    marginBottom: 4,
  },
  availableDescription: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    paddingHorizontal: 18,
    marginBottom: 16,
    lineHeight: 20,
  },
  availableListContent: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 14,
  },
  equipmentCard: {
    width: 220,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  equipmentImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    backgroundColor: LIGHT_GREEN_BACKGROUND,
  },
  equipmentDetails: {
    padding: 12,
    backgroundColor: MAIN_COLOR,
  },
  equipmentName: {
    fontFamily: 'Archivo-Bold',
    fontSize: 15,
    color: HEADER_TEXT_COLOR,
    marginBottom: 2,
  },
  equipmentType: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: HEADER_TEXT_COLOR,
    marginBottom: 8,
  },
  equipmentPrice: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
    marginBottom: 8,
  },
  equipmentPriceUnit: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: HEADER_TEXT_COLOR,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bookNowButton: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS - 2,
    paddingVertical: 10,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: MAIN_COLOR,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS - 2,
    paddingVertical: 10,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HEADER_TEXT_COLOR,
  },
  detailsButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: HEADER_TEXT_COLOR,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 150,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
  },
});
