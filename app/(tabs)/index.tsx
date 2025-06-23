import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useData } from '@/context/DataContext';
import { EquipmentCard } from '@/components/EquipmentCard';
import { FilterModal } from '@/components/FilterModal';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const SLATE_LOCATION_COLOR = '#D1D5DB';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';

export default function Dashboard() {
  const router = useRouter();
  const { rentalEquipment } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filteredEquipment, setFilteredEquipment] = useState(rentalEquipment);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const showDynamicSections = !searchQuery && !activeFilter;

  const featuredEquipmentData = rentalEquipment.slice(0, 4);
  const newArrivalsData = rentalEquipment.slice(4, 8);

  const categories = [
    'Tractors',
    'Harvesters',
    'Seeders',
    'Sprayers',
    'Tillage',
    'Loaders',
    'Plows',
    'Cultivators',
  ];

  const getGreeting = () => {
    const currentHour = new Date().getUTCHours() + 2;
    if (currentHour >= 6 && currentHour < 12) {
      return 'Good morning';
    }
    if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  };

  useEffect(() => {
    let currentFiltered = rentalEquipment;

    if (searchQuery) {
      currentFiltered = currentFiltered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (activeFilter) {
      currentFiltered = currentFiltered.filter(
        (item) => item.type === activeFilter,
      );
    }

    setFilteredEquipment(currentFiltered);
  }, [searchQuery, activeFilter, rentalEquipment]);

  const handleCategoryPress = (category: string) => {
    setActiveFilter((prevFilter) =>
      prevFilter === category ? null : category,
    );
  };

  const renderCategoryButton = (category: string) => {
    const isActive = category === activeFilter;

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
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContentWrapper}>
            <View style={styles.headerTopRow}>
              <View>
                <Text style={styles.greetingText}>{getGreeting()} </Text>
                <TouchableOpacity style={styles.locationDropdown}>
                  <Text style={styles.locationText}>
                    Location: Jason Moyo, Harare
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={SLATE_LOCATION_COLOR}
                  />
                </TouchableOpacity>
              </View>
            </View>
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
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesTitleWrapper}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => renderCategoryButton(category))}
          </ScrollView>
        </View>

        {showDynamicSections && featuredEquipmentData.length > 0 && (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Equipment</Text>
              <Text style={styles.sectionDescription}>
                Handpicked, top-rated rentals nearby.
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardScroll}
            >
              {featuredEquipmentData.map((item) => (
                <EquipmentCard
                  key={item.id}
                  equipment={item}
                  onPress={() => router.push(`/equipment/${item.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {showDynamicSections && newArrivalsData.length > 0 && (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <Text style={styles.sectionDescription}>
                Recently added equipment, fresh on the market!
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardScroll}
            >
              {newArrivalsData.map((item) => (
                <EquipmentCard
                  key={item.id}
                  equipment={item}
                  onPress={() => router.push(`/equipment/${item.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Near You</Text>
            <Text style={styles.sectionDescription}>
              Explore equipment ready for rent in your vicinity.
            </Text>
          </View>

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
                Try adjusting your search or filter criteria.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
  headerContainer: {
    backgroundColor: MAIN_COLOR,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  headerContentWrapper: {
    backgroundColor: MAIN_COLOR,
    borderBottomLeftRadius: BORDER_RADIUS * 2,
    borderBottomRightRadius: BORDER_RADIUS * 2,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  greetingText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 22,
    color: HEADER_TEXT_COLOR,
    marginBottom: 6,
  },
  locationDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: SLATE_LOCATION_COLOR,
    marginRight: 6,
  },
  searchAndFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: MAIN_COLOR,
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
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: MAIN_COLOR,
  },

  scrollContent: {
    paddingBottom: 24,
  },
  categoriesSection: {
    backgroundColor: CARD_BACKGROUND,
    paddingBottom: 14,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GREY,
    borderTopWidth: 1,
    borderTopColor: BORDER_GREY,
  },
  categoriesTitleWrapper: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  categoryButtonActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  categoryText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: TEXT_SECONDARY_GREY,
  },
  categoryTextActive: {
    color: HEADER_TEXT_COLOR,
  },
  contentSection: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    marginBottom: 18,
  },
  sectionHeader: {
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 6,
  },
  sectionDescription: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
  },
  horizontalCardScroll: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 14,
  },
  equipmentListContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  equipmentRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    minHeight: 180,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 12,
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    lineHeight: 22,
  },
});
