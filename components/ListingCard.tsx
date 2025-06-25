import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const HEADER_TEXT_COLOR = '#FFFFFF';

import { z } from 'zod';
import { EquipmentSchema, ListingSchema } from '@/utils/validators';

type EquipmentFromDB = z.infer<typeof EquipmentSchema>;
type ListingFromDB = z.infer<typeof ListingSchema>;

interface HydratedEquipment extends EquipmentFromDB {
  rating?: number;
}

interface HydratedListing extends ListingFromDB {
  equipment: HydratedEquipment;
}

interface ListingCardProps {
  listing: HydratedListing;
  onPress: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
}) => {
  const { equipment, price, rentalUnit, listingType, negotiable } = listing;
  const { name, images, type, make, model, condition, yearOfManufacture } =
    equipment;

  const imageUrl =
    images && images.length > 0 && images[0]
      ? images[0]
      : 'https://placehold.co/400x300/E5E7EB/4B5563?text=No+Image';

  const detailsLineParts = [];
  if (make) detailsLineParts.push(make);
  if (model) detailsLineParts.push(model);
  if (yearOfManufacture) detailsLineParts.push(String(yearOfManufacture));
  if (condition) detailsLineParts.push(condition);
  const detailsLine = detailsLineParts.join(' • ');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.equipmentName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.equipmentType} numberOfLines={1}>
          {type}
        </Text>

        {detailsLine ? (
          <Text style={styles.detailsLineText} numberOfLines={1}>
            {detailsLine}
          </Text>
        ) : null}
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            ${price.toFixed(2)}
            {listingType === 'rent' && rentalUnit ? `/${rentalUnit}` : ''}
          </Text>
        </View>

        {negotiable && (
          <View style={[styles.badge, styles.negotiableBadge]}>
            <Text style={[styles.badgeText, styles.negotiableBadgeText]}>
              Negotiable
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    overflow: 'hidden',
    flex: 1, // Ensures it takes available space in a grid
    minWidth: 150, // Minimum width for the card (to prevent extreme squishing)
    marginBottom: 10,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  image: {
    width: '100%',
    height: 100, // Slightly reduced image height for smaller cards
    resizeMode: 'cover',
  },
  infoContainer: {
    paddingVertical: 8, // Reduced vertical padding
    paddingHorizontal: 8, // Reduced horizontal padding
  },
  equipmentName: {
    fontFamily: 'Archivo-Bold',
    fontSize: 14, // Smaller font size
    color: TEXT_PRIMARY_DARK,
    marginBottom: 1, // Reduced margin
  },
  equipmentType: {
    fontFamily: 'Archivo-Regular',
    fontSize: 11, // Smaller font size
    color: TEXT_SECONDARY_GREY,
    marginBottom: 3, // Reduced margin
  },
  detailsLineText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 10, // Even smaller for dense info
    color: TEXT_SECONDARY_GREY,
    marginBottom: 6, // Reduced margin
  },
  footerContainer: {
    backgroundColor: MAIN_COLOR,
    paddingVertical: 8, // Reduced vertical padding
    paddingHorizontal: 8, // Reduced horizontal padding
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 14, // Made price smaller
    color: HEADER_TEXT_COLOR,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 4, // Reduced padding
    paddingVertical: 2, // Reduced padding
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  negotiableBadge: {
    backgroundColor: CARD_BACKGROUND,
    borderColor: CARD_BACKGROUND,
    // No top margin needed if price and badge are in a flex row
  },
  badgeText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 9, // Smallest font for badges
    color: TEXT_PRIMARY_DARK,
  },
  negotiableBadgeText: {
    color: MAIN_COLOR,
  },
});
