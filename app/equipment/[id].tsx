import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/Button';

export default function EquipmentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRentalEquipmentById } = useData();
  
  // Get equipment details from context
  const equipment = getRentalEquipmentById(id);
  
  if (!equipment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Equipment not found</Text>
        <Button onPress={() => router.back()} text="Go Back" style={styles.goBackButton} />
      </View>
    );
  }
  
  const handleBookingRequest = () => {
    router.push(`/booking/${id}`);
  };
  
  const handleContactOwner = () => {
    Alert.alert(
      'Contact Owner',
      `Would you like to contact ${equipment.owner?.name || 'the owner'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Owner', onPress: () => console.log('Call owner') },
        { text: 'Message Owner', onPress: () => console.log('Message owner') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: equipment.image || 'https://via.placeholder.com/150?text=No+Image' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{equipment.name}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="tools" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{equipment.type}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{equipment.location}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Rental Price</Text>
          <Text style={styles.price}>${equipment.rentalPrice?.toFixed(2)}</Text>
          <Text style={styles.priceUnit}>per day</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{equipment.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityItem}>
              <FontAwesome name="calendar" size={18} color="#4D7C0F" />
              <Text style={styles.availabilityText}>Available Now</Text>
            </View>
            
            <View style={styles.availabilityItem}>
              <MaterialIcons name="access-time" size={18} color="#4D7C0F" />
              <Text style={styles.availabilityText}>Minimum 1 day rental</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <View style={styles.ownerContainer}>
            <Image 
              source={{ uri: 'https://www.courtney.codes/assets/images/courtney.jpg' }}
              style={styles.ownerImage}
            />
            
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{equipment.owner?.name || 'Equipment Owner'}</Text>
              <Text style={styles.ownerLocation}>{equipment.location}</Text>
              
              <View style={styles.ownerRating}>
                {Array(5).fill(0).map((_, i) => (
                  <Text key={i} style={styles.starIcon}>★</Text>
                ))}
                <Text style={styles.ratingText}>4.8 (24 reviews)</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <Button 
          onPress={handleContactOwner}
          text="Contact Owner"
          variant="secondary"
          style={styles.contactButton}
        />
        
        <Button 
          onPress={handleBookingRequest}
          text="Request Booking"
          icon={<Feather name="arrow-right" size={20} color="#FFFFFF" />}
          style={styles.bookButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4D7C0F',
    marginRight: 8,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#4D7C0F',
  },
  priceUnit: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4D7C0F',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  availabilityContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
  },
  ownerContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  ownerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 4,
  },
  ownerLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#F59E0B',
    fontSize: 16,
    marginRight: 2,
  },
  ratingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  contactButton: {
    flex: 1,
    marginRight: 8,
  },
  bookButton: {
    flex: 1,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#DC2626',
    marginBottom: 16,
  },
  goBackButton: {
    width: 150,
  },
});