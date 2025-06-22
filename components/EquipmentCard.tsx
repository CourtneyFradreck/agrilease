import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RentalEquipment } from '@/types/equipment';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

interface EquipmentCardProps {
  equipment: RentalEquipment;
  onPress: () => void;
}

export function EquipmentCard({ equipment, onPress }: EquipmentCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: equipment.image  || 'https://via.placeholder.com/150?text=No+Image'}} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>{equipment.type}</Text>
        </View>
        
        <Text style={styles.name}>{equipment.name}</Text>
        
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{equipment.location}</Text>
          
          {equipment.distance && (
            <Text style={styles.distanceText}>{equipment.distance} km away</Text>
          )}
        </View>
        
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>
            {equipment.rating || '4.8'} ({equipment.reviewCount || '12'})
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${equipment.rentalPrice?.toFixed(2)}</Text>
          <Text style={styles.priceUnit}>/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  typeContainer: {
    backgroundColor: '#F0FDF4',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  typeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#4D7C0F',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 8,
  },
  distanceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#4D7C0F',
  },
  priceUnit: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 2,
  },
});