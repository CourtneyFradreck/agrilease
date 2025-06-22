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
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {equipment.image ? (
          <Image
            source={{ uri: equipment.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image" size={70} color="#E0E0E0" />{' '}
            {/* Smaller icon */}
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkToggle}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22} // Smaller icon
            color="#4D7C0F"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.headerInfo}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{equipment.type}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={12} color="#F59E0B" />{' '}
            {/* Smaller icon */}
            <Text style={styles.ratingText}>
              {equipment.rating?.toFixed(1) || '4.8'} (
              {equipment.reviewCount || '12'})
            </Text>
          </View>
        </View>

        <Text style={styles.name}>{equipment.name}</Text>

        <View style={styles.locationAndPriceContainer}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={12} color="#6B7280" />{' '}
            {/* Smaller icon */}
            <Text style={styles.locationText}>{equipment.location}</Text>
            {equipment.distance && (
              <Text style={styles.distanceText}>
                {' '}
                • {equipment.distance} km away
              </Text>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${equipment.rentalPrice?.toFixed(2)}
            </Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Remains 20 as requested
    overflow: 'hidden',
    marginBottom: 16,
    // Removed all shadows and elevation
  },
  imageWrapper: {
    width: '100%',
    height: 160, // Slightly reduced height
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F9FAFB',
  },
  imagePlaceholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12, // Smaller
    color: '#B0B0B0',
    marginTop: 6, // Adjusted margin
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10, // Adjusted position
    right: 10, // Adjusted position
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 5, // Slightly less padding
    zIndex: 1,
    // Removed borderWidth and borderColor
  },
  content: {
    padding: 14, // Slightly less padding
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6, // Slightly less margin
  },
  typeContainer: {
    backgroundColor: '#F0FDF4',
    alignSelf: 'flex-start',
    paddingHorizontal: 7, // Slightly less padding
    paddingVertical: 3, // Slightly less padding
    borderRadius: 4,
  },
  typeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11, // Smaller
    color: '#4D7C0F',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 18, // Smaller
    color: '#333333',
    marginBottom: 6, // Slightly less margin
  },
  locationAndPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6, // Slightly less margin
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8, // Slightly less margin
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12, // Smaller
    color: '#6B7280',
    marginLeft: 3, // Slightly less margin
  },
  distanceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12, // Smaller
    color: '#4B5563',
    marginLeft: 3, // Slightly less margin
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12, // Smaller
    color: '#4B5563',
    marginLeft: 3, // Slightly less margin
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 20, // Smaller
    color: '#4D7C0F',
  },
  priceUnit: {
    fontFamily: 'Inter-Regular',
    fontSize: 12, // Smaller
    color: '#6B7280',
    marginLeft: 2,
  },
});

