import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { FilterModal } from '@/components/FilterModal';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Re-defining constants from Dashboard for consistency
const MAIN_COLOR = '#4D7C0F';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BORDER_RADIUS = 10;
const LIGHT_GREEN_TINT = '#D4EDD4';
const VERY_LIGHT_GREEN_TINT = '#E6F0E6';
const HEADER_TEXT_COLOR = '#FFFFFF'; // This will now be less relevant for header BG but useful for text
const APP_BACKGROUND_COLOR = '#F9FAFB'; // Use this for header background now

// Custom Map Style JSON (Silver Theme) - unchanged
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

// Mock Data - unchanged
const mockClients = [
  {
    id: 'client1',
    name: 'AgriSolutions Inc.',
    equipment: 'Large Tractor',
    contact: '+263 771 234 567',
    image: 'https://via.placeholder.com/150/4D7C0F/FFFFFF?text=Tractor',
    coordinate: {
      latitude: -17.7565, // North of Harare CBD
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
      latitude: -17.892, // South-east of Harare CBD
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
      latitude: -17.82, // Near Harare CBD
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
      latitude: -17.85, // West of Harare CBD
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
      latitude: -17.8, // North-east of Harare
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

  // Initial region for Harare, Zimbabwe
  const [mapRegion, setMapRegion] = useState({
    latitude: -17.825166, // Harare latitude
    longitude: 31.03351, // Harare longitude
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  // Filter clients for map markers based on search query
  const filteredClientsForMap = searchQuery
    ? mockClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.equipment.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockClients;

  // Filter nearby equipment for the scroll view based on search query
  const filteredNearbyEquipment = searchQuery
    ? mockNearbyEquipment.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockNearbyEquipment;

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        customMapStyle={mapStyleJson}
        // onRegionChangeComplete={setMapRegion}
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

      {/* Header Overlay - Styled to match Dashboard with modifications */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.menuButton}>
            <Fontisto name="nav-icon-list-a" size={20} color={MAIN_COLOR} />{' '}
            {/* Reduced size and changed color */}
          </TouchableOpacity>
          <View style={styles.searchSection}>
            <View style={styles.searchInputWrapper}>
              <Fontisto
                name="search"
                size={16}
                color="#A3A3A3"
                style={styles.searchIcon}
              />{' '}
              {/* Reduced size */}
              <TextInput
                style={styles.searchInput}
                placeholder="Search equipment..."
                placeholderTextColor="#A3A3A3"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Fontisto name="equalizer" size={18} color={MAIN_COLOR} />{' '}
              {/* Reduced size */}
            </TouchableOpacity>
          </View>
          {/* Removed Notification Button */}
        </View>
      </SafeAreaView>

      {/* Available Equipment Section */}
      <View style={styles.availableEquipmentContainer}>
        <Text style={styles.availableTitle}>Available Equipment Near You</Text>
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
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.equipmentImage}
                />
                <View style={styles.equipmentDetails}>
                  <Text style={styles.equipmentName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.equipmentType}>{item.type}</Text>
                  <Text style={styles.equipmentPrice}>
                    ${item.rentalPrice}
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
      </View>

      {/* Filter Modal */}
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
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // --- Header styles matching Dashboard but with modifications ---
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: APP_BACKGROUND_COLOR, // Changed from MAIN_COLOR to match background
    paddingHorizontal: 20,
    paddingTop: 40, // Reduced padding
    paddingBottom: 20, // Reduced padding
    borderBottomLeftRadius: 10, // Removed bottom radius for a cleaner look
    borderBottomRightRadius: 10, // Removed bottom radius
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.1, // Reduced shadow
    shadowRadius: 3, // Reduced shadow
    elevation: 4, // Reduced shadow
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Keep space-between, will auto-adjust with notification removal
    alignItems: 'center',
    marginBottom: 0, // Reduced margin
  },
  menuButton: {
    width: 38, // Reduced size
    height: 38, // Reduced size
    borderRadius: BORDER_RADIUS,
    backgroundColor: VERY_LIGHT_GREEN_TINT, // Changed background to match filter button
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // Added subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 15,
    height: 45, // Reduced height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.1, // Reduced shadow
    shadowRadius: 4, // Reduced shadow
    elevation: 4, // Reduced shadow
    marginHorizontal: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    fontFamily: 'Archivo-Regular',
    flex: 1,
    height: '100%',
    fontSize: 15, // Slightly reduced font size
    color: TEXT_PRIMARY_DARK,
    paddingVertical: 0,
  },
  filterButton: {
    width: 38, // Reduced size
    height: 38, // Reduced size
    borderRadius: BORDER_RADIUS, // Adjusted for new size
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: VERY_LIGHT_GREEN_TINT,
  },
  // Removed notificationButton and notificationBadge styles
  // --- End Header styles ---

  // Callout styles (unchanged, but using new color constants)
  calloutContainer: {
    width: 150,
    padding: 10,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Carousel styles (Adjusted for consistency)
  availableEquipmentContainer: {
    position: 'absolute',
    bottom: 75,
    width: '100%',
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: BORDER_RADIUS * 2,
    borderTopRightRadius: BORDER_RADIUS * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  availableTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 20,
    color: TEXT_PRIMARY_DARK,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 15,
  },
  availableListContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 15,
  },
  equipmentCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  equipmentImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  equipmentDetails: {
    padding: 12,
  },
  equipmentName: {
    fontFamily: 'Archivo-SemiBold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
  },
  equipmentType: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 4,
  },
  equipmentPrice: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: MAIN_COLOR,
    marginBottom: 8,
  },
  equipmentPriceUnit: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: TEXT_SECONDARY_GREY,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bookNowButton: {
    flex: 1,
    backgroundColor: LIGHT_GREEN_TINT,
    borderRadius: BORDER_RADIUS - 4,
    paddingVertical: 10,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 13,
    color: MAIN_COLOR,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS - 4,
    paddingVertical: 10,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  // Empty state styles matching Dashboard
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
