import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '@/context/DataContext';
import { EquipmentCard } from '@/components/EquipmentCard';
import { FilterModal } from '@/components/FilterModal';
import { DebugTools } from '@/components/DebugTools';

// Define a consistent border radius for the application
const BORDER_RADIUS = 10;
const MAIN_COLOR = '#4D7C0F'; // Main brand green
const LIGHT_GREEN_TINT = '#D4EDD4'; // A light tint of green
const VERY_LIGHT_GREEN_TINT = '#E6F0E6'; // Even lighter tint for background elements
const HEADER_TEXT_COLOR = '#FFFFFF'; // White for text on main color background
const SUBTLE_GREY_BORDER = '#E0E0E0'; // More subtle grey for borders
const SLATE_LOCATION_COLOR = '#CBD5E1'; // A slate color for location text
const TEXT_PRIMARY_DARK = '#1F2937'; // Dark text for general content
const TEXT_SECONDARY_GREY = '#6B7280'; // Secondary grey text

const equipmentIcons: { [key: string]: { library: string; name: string } } = {
  Tractors: { library: 'MaterialCommunityIcons', name: 'tractor' },
  Harvesters: { library: 'MaterialCommunityIcons', name: 'grain' },
  Seeders: { library: 'MaterialCommunityIcons', name: 'seed' },
  Sprayers: { library: 'MaterialCommunityIcons', name: 'spray' },
  Tillage: { library: 'MaterialCommunityIcons', name: 'shovel' },
  Irrigation: { library: 'MaterialCommunityIcons', name: 'water-pump' },
};

export default function Dashboard() {
  const router = useRouter();
  const { rentalEquipment, resetToMockData } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filteredEquipment, setFilteredEquipment] = useState(rentalEquipment);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showFeatured, setShowFeatured] = useState(true);

  const featuredEquipmentData = rentalEquipment.slice(0, 4);

  const categories = [
    'Tractors',
    'Harvesters',
    'Seeders',
    'Sprayers',
    'Tillage',
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    // Use current time in CAT (Zimbabwe) for greeting
    const currentHourCAT = new Date().getUTCHours() + 2;
    if (currentHourCAT >= 6 && currentHourCAT < 12) {
      return 'Good morning';
    }
    if (currentHourCAT >= 12 && currentHourCAT < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  };

  useEffect(() => {
    filterEquipment(searchQuery, activeFilter);
    setShowFeatured(!(searchQuery || activeFilter));
  }, [searchQuery, activeFilter, rentalEquipment]);

  const filterEquipment = (query: string, category: string | null) => {
    let filtered = rentalEquipment;

    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (category) {
      filtered = filtered.filter((item) => item.type === category);
    }

    setFilteredEquipment(filtered);
  };

  const handleCategoryPress = (category: string) => {
    if (activeFilter === category) {
      setActiveFilter(null);
    } else {
      setActiveFilter(category);
    }
  };

  const renderCategoryButton = (category: string) => {
    const isActive = category === activeFilter;
    const icon = equipmentIcons[category];
    const iconColor = isActive ? '#FFFFFF' : '#5C6A7B';
    const iconSize = 18;

    const IconComponent = icon
      ? {
          Feather: Feather,
          Ionicons: Ionicons,
          MaterialCommunityIcons: MaterialCommunityIcons,
        }[icon.library as 'Feather' | 'Ionicons' | 'MaterialCommunityIcons'] ||
        Feather
      : null;

    return (
      <TouchableOpacity
        key={category}
        style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
        onPress={() => handleCategoryPress(category)}
      >
        {IconComponent && icon && (
          <IconComponent name={icon.name} size={iconSize} color={iconColor} />
        )}
        <Text
          style={[styles.categoryText, isActive && styles.categoryTextActive]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <TouchableOpacity style={styles.locationDropdown}>
              <Text style={styles.locationText}>
                Location: Jason Moyo, Harare
              </Text>
              <Feather
                name="chevron-down"
                size={12}
                color={SLATE_LOCATION_COLOR}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setHasNotifications(false)}
          >
            <Ionicons
              name="notifications-outline"
              size={24} // Increased size slightly
              color={MAIN_COLOR}
            />
            {hasNotifications && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Feather
              name="search"
              size={18} // Increased size
              color="#A3A3A3"
              style={styles.searchIcon}
            />
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
            <Feather name="sliders" size={20} color={MAIN_COLOR} />{' '}
            {/* Increased size */}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Categories Section */}
        <View style={styles.categoriesRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => renderCategoryButton(category))}
          </ScrollView>
        </View>

        {/* Featured Equipment Section - Conditionally rendered */}
        {showFeatured && featuredEquipmentData.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Equipment</Text>
              <Text style={styles.sectionDescription}>
                Handpicked for you, top-rated rentals nearby.
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContent}
            >
              {featuredEquipmentData.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.featuredCard}
                  onPress={() => router.push(`/equipment/${item.id}`)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.featuredCardImage}
                  />
                  <View style={styles.featuredCardDetails}>
                    <Text style={styles.featuredCardName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.featuredCardType}>{item.type}</Text>
                    <Text style={styles.featuredCardPrice}>
                      ${item.rentalPrice}
                      <Text style={styles.featuredCardPriceUnit}>/day</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Available Near You Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Near You</Text>
          <Text style={styles.sectionDescription}>
            Explore equipment ready for rent in your vicinity.
          </Text>
        </View>

        {/* Equipment List (Grid) */}
        {filteredEquipment.length > 0 ? (
          <FlatList
            data={filteredEquipment}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EquipmentCard
                equipment={item}
                onPress={() => router.push(`/equipment/${item.id}`)}
              />
            )}
            numColumns={2}
            columnWrapperStyle={styles.equipmentRow}
            contentContainerStyle={styles.equipmentListContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>No equipment found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      </ScrollView>

      {showDebugTools && <DebugTools />}

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
    backgroundColor: '#F9FAFB', // Light background for the main content
  },
  // --- NEW/IMPROVED HEADER STYLES ---
  headerContainer: {
    backgroundColor: MAIN_COLOR, // Main brand green background for the header
    paddingHorizontal: 20,
    paddingTop: 45, // Sufficient padding from top (status bar area)
    paddingBottom: 30, // More padding to separate from content below
    borderBottomLeftRadius: 20, // Soft rounded corners at the bottom
    borderBottomRightRadius: 20,
    overflow: 'hidden', // Ensures shadow/border-radius work correctly
    shadowColor: '#000', // Subtle shadow for depth
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // More space below greeting, above search
  },
  greetingText: {
    fontFamily: 'Archivo-Bold', // Using Archivo-Bold
    fontSize: 22, // Slightly larger for prominence
    color: HEADER_TEXT_COLOR,
    marginBottom: 4,
  },
  locationDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontFamily: 'Archivo-Medium', // Using Archivo-Medium
    fontSize: 14,
    color: SLATE_LOCATION_COLOR,
    marginRight: 4,
  },
  notificationButton: {
    width: 44, // Slightly larger touch target
    height: 44,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Solid white background
    shadowColor: '#000', // Subtle shadow for button
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background for the whole search bar
    borderRadius: BORDER_RADIUS, // More rounded, pill-like shape
    paddingHorizontal: 15,
    height: 50, // Taller search bar
    shadowColor: '#000', // More prominent shadow for the search bar
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10, // More space for the icon
  },
  searchInput: {
    fontFamily: 'Archivo-Regular', // Using Archivo-Regular
    flex: 1,
    height: '100%',
    fontSize: 16, // Slightly larger text
    color: TEXT_PRIMARY_DARK,
    paddingVertical: 0,
  },
  filterButton: {
    width: 40, // Consistent with search height, but square
    height: 40,
    borderRadius: BORDER_RADIUS, // Rounded for the filter button
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: VERY_LIGHT_GREEN_TINT, // Light green background for filter button
  },

  scrollContent: {
    paddingTop: 20,
    backgroundColor: '#F9FAFB',
  },
  categoriesRow: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  categoriesContent: {
    gap: 10, // Slightly increased gap
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 15, // Increased padding
    paddingVertical: 10, // Increased padding
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SUBTLE_GREY_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Slightly less shadow
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  categoryText: {
    fontFamily: 'Archivo-Medium', // Using Archivo-Medium
    fontSize: 13, // Slightly larger font
    color: TEXT_SECONDARY_GREY,
    marginLeft: 8, // More space from icon
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15, // More space
    marginTop: 10, // Space above each section
  },
  sectionTitle: {
    fontFamily: 'Archivo-Bold', // Using Archivo-Bold
    fontSize: 18, // Slightly larger
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
  },
  sectionDescription: {
    fontFamily: 'Archivo-Regular', // Using Archivo-Regular
    fontSize: 13, // Slightly larger
    color: TEXT_SECONDARY_GREY,
  },
  featuredContent: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 15, // Increased gap
  },
  featuredCard: {
    width: 250, // Slightly wider card
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // More prominent shadow
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  featuredCardImage: {
    width: '100%',
    height: 140, // Slightly taller image
    resizeMode: 'cover',
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  featuredCardDetails: {
    padding: 15, // More padding inside card
  },
  featuredCardName: {
    fontFamily: 'Archivo-Bold', // Using Archivo-Bold
    fontSize: 17, // Slightly larger
    color: TEXT_PRIMARY_DARK,
    marginBottom: 5,
  },
  featuredCardType: {
    fontFamily: 'Archivo-Regular', // Using Archivo-Regular
    fontSize: 12, // Slightly larger
    color: TEXT_SECONDARY_GREY,
    marginBottom: 8,
  },
  featuredCardPrice: {
    fontFamily: 'Archivo-Bold', // Using Archivo-Bold
    fontSize: 18, // Slightly larger
    color: MAIN_COLOR,
  },
  featuredCardPriceUnit: {
    fontFamily: 'Archivo-Regular', // Using Archivo-Regular
    fontSize: 12,
    color: TEXT_SECONDARY_GREY,
  },
  equipmentListContent: {
    paddingHorizontal: 15,
  },
  equipmentRow: {
    justifyContent: 'space-between',
    marginBottom: 10, // More spacing between rows
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // More padding
    minHeight: 200, // Taller empty state
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold', // Using Archivo-Bold
    fontSize: 16, // Slightly larger
    color: TEXT_PRIMARY_DARK,
    marginBottom: 10, // More space
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular', // Using Archivo-Regular
    fontSize: 14, // Slightly larger
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    lineHeight: 20, // Better readability
  },
});
