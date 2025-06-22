import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RentalEquipment } from '@/types/equipment';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

interface EquipmentCardProps {
  equipment: RentalEquipment;
  onPress: () => void;
}

export function EquipmentCard({ equipment, onPress }: EquipmentCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // You might want to dispatch an action or call an API here
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {equipment.image ? (
          <Image
            source={{ uri: equipment.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image" size={50} color="#D1D5DB" />
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkToggle}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color="#4D7C0F" // Main green
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
            <MaterialIcons name="dashboard" size={12} color="#6B7280" />
            <Text style={styles.specText}>{equipment.spec1 || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialIcons name="local-gas-station" size={12} color="#6B7280" />
            <Text style={styles.specText}>{equipment.spec2 || 'N/A'}</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialIcons name="settings" size={12} color="#6B7280" />
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

        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
    maxWidth: '48%',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0FDF4', // Light green
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
    backgroundColor: '#F0FDF4', // Light green
  },
  imagePlaceholderText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: '#B0B0B0',
    marginTop: 4,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 5,
    zIndex: 1,
  },
  driverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#E5E7EB', // Accent grayish background
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  driverBadgeText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 9,
    color: '#4D7C0F', // Main green text
  },
  detailsContainer: {
    padding: 10,
  },
  equipmentName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 0,
  },
  equipmentType: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#6B7280',
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
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: '#6B7280',
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
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#4D7C0F', // Main green
  },
  priceUnit: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#4B5563',
    marginLeft: 2,
  },
  bookNowButton: {
    backgroundColor: '#4D7C0F', // Main green
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowButtonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
