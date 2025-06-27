import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { ListingCard } from '@/components/ListingCard';
import { EquipmentSchema, ListingSchema } from '@/utils/validators';
import { z } from 'zod';
import { useFocusEffect } from '@react-navigation/native';

type EquipmentFromDB = z.infer<typeof EquipmentSchema>;
type ListingFromDB = z.infer<typeof ListingSchema>;

interface HydratedEquipment extends EquipmentFromDB {
  yearOfManufacture?: z.infer<typeof EquipmentSchema>['yearOfManufacture'];
}

interface HydratedListing extends ListingFromDB {
  equipment: HydratedEquipment;
}

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const LOCATION_COLOR = '#D1D5DB';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';

export default function Dashboard() {
  const router = useRouter();
  const [allListings, setAllListings] = useState<HydratedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<HydratedListing[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Tractor',
    'Harvester',
    'Seeder',
    'Sprayer',
    'Tillage',
    'Loader',
    'Plow',
    'Cultivator',
  ];

  const getGreeting = () => {
    const currentHour = new Date().getUTCHours() + 2;
    if (currentHour >= 6 && currentHour < 12) return 'Good morning';
    if (currentHour >= 12 && currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchListingsData = useCallback(async () => {
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    try {
      const equipmentCollectionRef = collection(db, `equipment`);
      const equipmentSnapshot = await getDocs(equipmentCollectionRef);
      const equipments: { [key: string]: EquipmentFromDB } = {};

      equipmentSnapshot.docs.forEach((doc) => {
        try {
          const parsedEquipment = EquipmentSchema.parse({
            id: doc.id,
            ...doc.data(),
          });
          equipments[doc.id] = parsedEquipment;
        } catch (e) {
          console.error(`Error parsing equipment ${doc.id}:`, e);
        }
      });

      const listingsQuery = query(
        collection(db, `listings`),
        orderBy('createdAt', 'desc'),
        limit(50),
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const hydratedListings: HydratedListing[] = [];

      for (const doc of listingsSnapshot.docs) {
        try {
          const parsedListing = ListingSchema.parse({
            id: doc.id,
            ...doc.data(),
          });
          const associatedEquipment = equipments[parsedListing.equipmentId];

          if (associatedEquipment) {
            hydratedListings.push({
              ...parsedListing,
              equipment: {
                ...associatedEquipment,
              },
            });
          } else {
            console.warn(
              `Equipment with ID ${parsedListing.equipmentId} not found for listing ${doc.id}`,
            );
          }
        } catch (e) {
          console.error(`Error parsing listing ${doc.id}:`, e);
        }
      }

      setAllListings(hydratedListings);
      setFilteredListings(hydratedListings);
    } catch (e) {
      setError('Failed to fetch data: ' + (e as Error).message);
      console.error('Firebase fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard screen focused, fetching listings...');
      fetchListingsData();

      return () => {
        console.log('Dashboard screen unfocused');
      };
    }, [fetchListingsData]),
  );

  useEffect(() => {
    let currentFiltered = allListings;

    if (searchQuery) {
      currentFiltered = currentFiltered.filter(
        (item) =>
          item.equipment.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.equipment.type.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (activeFilter) {
      currentFiltered = currentFiltered.filter(
        (item) =>
          item.equipment.type.toLowerCase() === activeFilter.toLowerCase(),
      );
    }

    setFilteredListings(currentFiltered);
  }, [searchQuery, activeFilter, allListings]);

  const handleCategoryPress = (category: string) => {
    setActiveFilter((prevFilter) =>
      prevFilter === category ? null : category,
    );
  };

  const renderCategoryButton = (category: string) => {
    const isActive = category.toLowerCase() === activeFilter?.toLowerCase();

    return (
      <TouchableOpacity
        key={category}
        style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.categoryText, isActive && styles.categoryTextActive]}
        >
          {category}s
        </Text>
      </TouchableOpacity>
    );
  };

  const handleNotificationPress = () => {
    console.log('Notification button pressed!');
    router.push('/notifications');
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListingsData();
  }, [fetchListingsData]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={{
            marginTop: 20,
            padding: 10,
            borderWidth: 1,
            borderColor: MAIN_COLOR,
            borderRadius: BORDER_RADIUS,
          }}
        >
          <Text style={{ color: MAIN_COLOR, fontFamily: 'Archivo-Medium' }}>
            Tap to Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const listingsToDisplay =
    searchQuery || activeFilter ? filteredListings : allListings;

  return (
    <View style={styles.container}>
      <View style={styles.fixedHeader}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <TouchableOpacity style={styles.locationContainer}>
                  <Text style={styles.locationText}>Jason Moyo, Harare</Text>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color={LOCATION_COLOR}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotificationPress}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={MAIN_COLOR}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Feather name="search" size={18} color={TEXT_SECONDARY_GREY} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search equipment..."
                  placeholderTextColor={TEXT_SECONDARY_GREY}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
                <Feather name="sliders" size={18} color={MAIN_COLOR} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[MAIN_COLOR]}
            tintColor={MAIN_COLOR}
          />
        }
      >
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <Text style={styles.categoriesSubtitle}>
            Browse equipment by type
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {listingsToDisplay.length > 0 ? (
          <FlatList
            data={listingsToDisplay}
            renderItem={({ item }) => (
              <ListingCard
                listing={item}
                onPress={() => router.push(`/listings/${item.id}`)}
              />
            )}
            keyExtractor={(item) => item.id!}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Matches Found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    fontFamily: 'Archivo-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    fontFamily: 'Archivo-Medium',
  },

  fixedHeader: {
    backgroundColor: MAIN_COLOR,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 20 : 30,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerContent: {
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'column',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 20,
    color: HEADER_TEXT_COLOR,
    marginBottom: 4,
    textAlign: 'left',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'left',
  },
  locationText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 12,
    color: LOCATION_COLOR,
    marginRight: 4,
    textAlign: 'left',
  },
  notificationButton: {
    padding: 6,
    borderRadius: BORDER_RADIUS,
    backgroundColor: CARD_BACKGROUND,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    fontFamily: 'Archivo-Regular',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS,
    backgroundColor: CARD_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
  },

  scrollViewContent: {
    flex: 1,
    marginTop: 75,
    backgroundColor: CARD_BACKGROUND,
  },
  scrollViewContentContainer: {
    paddingTop: Platform.select({
      ios: 110,
      android: 100,
    }),
    paddingBottom: Platform.OS === 'ios' ? 70 : 65,
  },
  categoriesSection: {
    backgroundColor: CARD_BACKGROUND,
    marginBottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  categoriesTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 15,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
    textAlign: 'left',
  },
  categoriesSubtitle: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'left',
  },
  categoriesScroll: {
    paddingHorizontal: 0,
    gap: 12,
  },
  categoryButton: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  categoryButtonActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  categoryText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 12,
    color: TEXT_PRIMARY_DARK,
  },
  categoryTextActive: {
    color: HEADER_TEXT_COLOR,
  },

  gridContainer: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    lineHeight: 20,
  },
});
