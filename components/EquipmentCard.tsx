import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RentalEquipment } from '@/types/equipment';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const SLATE_LOCATION_COLOR = '#D1D5DB';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';

const LIGHT_GREEN_BACKGROUND = '#F0FDF4';
const TEXT_LIGHT_GREY = '#B0B0B0';
const TEXT_DARK_GREY = '#4B5563';

interface EquipmentCardProps {
  equipment: RentalEquipment;
  onPress: () => void;
}

export function EquipmentCard({ equipment, onPress }: EquipmentCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {equipment.image ? (
          <Image
            source={{ uri: equipment.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons
              name="image"
              size={50}
              color={SLATE_LOCATION_COLOR}
            />
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={MAIN_COLOR}
          />
        </TouchableOpacity>
        {equipment.hasDriver && (
          <View style={styles.driverBadge}>
            <Text style={styles.driverBadgeText}>Driver</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.equipmentName} numberOfLines={1}>
          {equipment.name}
        </Text>
        <Text style={styles.equipmentType}>{equipment.type}</Text>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <MaterialIcons
              name="dashboard"
              size={12}
              color={TEXT_SECONDARY_GREY}
            />
            <Text style={styles.specText}>{equipment.spec1 || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialIcons
              name="local-gas-station"
              size={12}
              color={TEXT_SECONDARY_GREY}
            />
            <Text style={styles.specText}>{equipment.spec2 || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialIcons
              name="settings"
              size={12}
              color={TEXT_SECONDARY_GREY}
            />
            <Text style={styles.specText}>{equipment.spec3 || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.priceAndRatingRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${equipment.rentalPrice?.toFixed(0)}
            </Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {equipment.rating?.toFixed(1) || '4.8'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bookNowButton} activeOpacity={0.7}>
          <Text style={styles.bookNowButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    marginHorizontal: 4,
    maxWidth: '48%',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: LIGHT_GREEN_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: LIGHT_GREEN_BACKGROUND,
  },
  imagePlaceholderText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 10,
    color: TEXT_LIGHT_GREY,
    marginTop: 4,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 6,
    padding: 5,
    zIndex: 1,
  },
  driverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: BORDER_GREY,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  driverBadgeText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 9,
    color: MAIN_COLOR,
  },
  detailsContainer: {
    padding: 10,
  },
  equipmentName: {
    fontFamily: 'Archivo-Bold',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 0,
  },
  equipmentType: {
    fontFamily: 'Archivo-Regular',
    fontSize: 11,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 6,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  specText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 10,
    color: TEXT_SECONDARY_GREY,
    marginLeft: 3,
  },
  priceAndRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: MAIN_COLOR,
  },
  priceUnit: {
    fontFamily: 'Archivo-Regular',
    fontSize: 10,
    color: TEXT_SECONDARY_GREY,
    marginLeft: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 10,
    color: TEXT_DARK_GREY,
    marginLeft: 2,
  },
  bookNowButton: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 13,
    color: HEADER_TEXT_COLOR,
  },
});
