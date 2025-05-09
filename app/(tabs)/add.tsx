import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/Button';

type ListingType = 'rental' | 'sale';

export default function AddListing() {
  const router = useRouter();
  const { addRentalEquipment, addMarketplaceItem } = useData();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [listingType, setListingType] = useState<ListingType>('rental');
  
  // For marketplace items only
  const [condition, setCondition] = useState('');
  const [year, setYear] = useState('');
  
  // Equipment types for quick selection
  const equipmentTypes = [
    'Tractor', 'Harvester', 'Seeder', 'Sprayer', 'Tillage', 'Irrigation', 'Other'
  ];
  
  const handleTypeSelection = (selectedType: string) => {
    setType(selectedType);
  };
  
  const handleAddListing = () => {
    // Basic validation
    if (!name || !type || !price || !description || !location) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }
    
    // Add listing based on type
    if (listingType === 'rental') {
      addRentalEquipment({
        name,
        type,
        rentalPrice: priceValue,
        description,
        location,
        // Using a random image from Pexels for demo
        image: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg'
      });
    } else {
      if (!condition || !year) {
        Alert.alert('Missing Information', 'Please add condition and year for marketplace items');
        return;
      }
      
      addMarketplaceItem({
        title: name,
        type,
        price: priceValue,
        description,
        location,
        condition,
        year: parseInt(year),
        // Using a random image from Pexels for demo
        image: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg'
      });
    }
    
    Alert.alert(
      'Success',
      `Your equipment has been listed for ${listingType === 'rental' ? 'rent' : 'sale'}`,
      [{ text: 'OK', onPress: () => {
        // Navigate to the appropriate tab
        if (listingType === 'rental') {
          router.push('/');
        } else {
          router.push('/marketplace');
        }
      }}]
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.listingTypeContainer}>
            <Text style={styles.listingTypeLabel}>Listing Type:</Text>
            <View style={styles.listingTypeOptions}>
              <TouchableOpacity
                style={[
                  styles.listingTypeButton,
                  listingType === 'rental' && styles.listingTypeButtonActive
                ]}
                onPress={() => setListingType('rental')}
              >
                <Text style={[
                  styles.listingTypeText,
                  listingType === 'rental' && styles.listingTypeTextActive
                ]}>For Rent</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.listingTypeButton,
                  listingType === 'sale' && styles.listingTypeButtonActive
                ]}
                onPress={() => setListingType('sale')}
              >
                <Text style={[
                  styles.listingTypeText,
                  listingType === 'sale' && styles.listingTypeTextActive
                ]}>For Sale</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.photoUploadContainer}>
            <TouchableOpacity style={styles.photoUploadButton}>
              <Feather name="camera" size={40} color="#6B7280" />
              <Text style={styles.photoUploadText}>Add Photos</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Equipment Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter equipment name"
              placeholderTextColor="#A3A3A3"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Equipment Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="Select or enter equipment type"
              placeholderTextColor="#A3A3A3"
              value={type}
              onChangeText={setType}
            />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.typeOptionsContainer}
            >
              {equipmentTypes.map((equipType) => (
                <TouchableOpacity
                  key={equipType}
                  style={[
                    styles.typeOption,
                    type === equipType && styles.typeOptionActive
                  ]}
                  onPress={() => handleTypeSelection(equipType)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    type === equipType && styles.typeOptionTextActive
                  ]}>{equipType}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {listingType === 'rental' ? 'Rental Price (per day) *' : 'Selling Price *'}
            </Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor="#A3A3A3"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {listingType === 'sale' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Condition *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Excellent, Good, Fair"
                  placeholderTextColor="#A3A3A3"
                  value={condition}
                  onChangeText={setCondition}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Year *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter manufacturing year"
                  placeholderTextColor="#A3A3A3"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide details about the equipment"
              placeholderTextColor="#A3A3A3"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your location"
              placeholderTextColor="#A3A3A3"
              value={location}
              onChangeText={setLocation}
            />
          </View>
          
          <Button 
            text={`List Equipment ${listingType === 'rental' ? 'for Rent' : 'for Sale'}`}
            onPress={handleAddListing}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  listingTypeContainer: {
    marginBottom: 20,
  },
  listingTypeLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  listingTypeOptions: {
    flexDirection: 'row',
  },
  listingTypeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  listingTypeButtonActive: {
    backgroundColor: '#4D7C0F',
  },
  listingTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
  listingTypeTextActive: {
    color: '#FFFFFF',
  },
  photoUploadContainer: {
    marginBottom: 20,
  },
  photoUploadButton: {
    height: 160,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  typeOptionsContainer: {
    marginTop: 8,
    maxHeight: 44,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 8,
  },
  typeOptionActive: {
    backgroundColor: '#4D7C0F',
  },
  typeOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#4B5563',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  submitButton: {
    marginTop: 8,
  },
});