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
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/FirebaseConfig';
import { EquipmentSchema, ListingSchema } from '@/utils/validators';
import { MaterialIcons } from '@expo/vector-icons';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { Image } from 'react-native';

// --- Constants ---
const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';

// --- Type Definitions ---
type ListingType = 'rental' | 'sale';
type RentalUnit = 'hour' | 'day' | 'week' | 'month';
type EquipmentCondition = z.infer<typeof EquipmentSchema>['condition'];

export default function AddListing() {
  const router = useRouter();

  // State variables for form inputs
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [listingType, setListingType] = useState<ListingType>('rental');
  const [rentalUnit, setRentalUnit] = useState<RentalUnit>('day');
  const [image, setImage] = useState<string | null>(null);

  const [condition, setCondition] = useState<EquipmentCondition | ''>('');
  const [year, setYear] = useState('');
  const [power, setPower] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmissionType, setTransmissionType] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Enum options for selectors
  const equipmentTypes = [
    'Tractor',
    'Harvester',
    'Seeder',
    'Sprayer',
    'Tillage',
    'Irrigation',
    'Other',
  ];

    // Function to handle image picking from camera
  const pickImageFromCamera = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take a photo');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      } else {
        console.warn('Camera: No image URI found in result.assets[0].');
        Alert.alert('Error', 'Could not get image from camera. Please try again.');
      }
    }
  };

  // Function to handle image picking from gallery
  const pickImageFromGallery = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need media library permissions to select a photo');
      return;
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      } else {
        console.warn('Gallery: No image URI found in result.assets[0].');
        Alert.alert('Error', 'Could not get image from gallery. Please try again.');
      }
    }
  };

  // Function to prompt user to choose camera or gallery
  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: pickImageFromCamera },
        { text: 'Choose from Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  

  const equipmentConditions: EquipmentCondition[] = [
    'Excellent',
    'Good',
    'Fair',
    'Needs Repair',
  ];

  const rentalUnits: RentalUnit[] = ['hour', 'day', 'week', 'month'];

  // Function to clear all form fields
  const clearForm = () => {
    setName('');
    setType('');
    setMake('');
    setModel('');
    setPrice('');
    setDescription('');
    setLocationAddress('');
    setListingType('rental');
    setRentalUnit('day');
    setCondition('');
    setYear('');
    setPower('');
    setFuelType('');
    setTransmissionType('');
  };

  const handleAddListing = async () => {
    // Basic client-side validation
    if (!name || !type || !price || !description || !locationAddress) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid positive price.');
      return;
    }

    const yearValue = year ? parseInt(year, 10) : undefined;
    if (
      year &&
      (isNaN(yearValue!) ||
        yearValue! < 1900 ||
        yearValue! > new Date().getFullYear() + 5)
    ) {
      Alert.alert(
        'Invalid Year',
        'Please enter a valid manufacturing year (e.g., 2020).',
      );
      return;
    }

    if (listingType === 'rental' && !rentalUnit) {
      Alert.alert(
        'Missing Information',
        'Please select a rental unit (e.g., Day, Week, Hour, Month).',
      );
      return;
    }

    if (listingType === 'sale' && !condition) {
      Alert.alert(
        'Missing Information',
        'Please specify the condition for items listed for sale.',
      );
      return;
    }

    setSubmitting(true);

    try {
      const auth = getAuth();
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        Alert.alert(
          'Authentication Error',
          'You must be logged in to add a listing.',
        );
        return;
      }

      // --- Prepare Equipment Data ---
      const newEquipmentData: Omit<
        z.infer<typeof EquipmentSchema>,
        'id' | 'rating'
      > = {
        name,
        type,
        make: make || '',
        model: model || '',
        yearOfManufacture: yearValue,
        images: [],
        ownerId: currentUserId,
        description,
        condition: condition || 'Fair',
        currentLocation: {
          latitude: -17.825166, // Example: Harare's latitude
          longitude: 31.03351, // Example: Harare's longitude
        },
        lastUpdatedAt: Timestamp.now(),
        power: power || undefined,
        fuelType: fuelType || undefined,
        transmissionType: transmissionType || undefined,
      };

      const parsedEquipmentData = EquipmentSchema.parse(newEquipmentData);

      const equipmentCollectionRef = collection(db, `equipment`);
      const equipmentDocRef = await addDoc(
        equipmentCollectionRef,
        parsedEquipmentData,
      );
      const equipmentId = equipmentDocRef.id;

      // --- Prepare Listing Data ---
      const newListingData: Omit<z.infer<typeof ListingSchema>, 'id'> = {
        equipmentId,
        ownerId: currentUserId,
        listingType: listingType === 'rental' ? 'rent' : 'sell',
        status: 'active',
        price: priceValue,
        rentalUnit: listingType === 'rental' ? rentalUnit : undefined,
        availabilityStartDate: Timestamp.now(),
        availabilityEndDate:
          listingType === 'rental'
            ? Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : undefined,
        createdAt: Timestamp.now(),
        listingLocation: {
          latitude: -17.825166, // Example: Harare's latitude
          longitude: 31.03351, // Example: Harare's longitude
        },
        negotiable: false,
        views: 0,
      };

      ListingSchema.parse(newListingData);

      const listingsCollectionRef = collection(db, `listings`);
      await addDoc(listingsCollectionRef, newListingData);

      Alert.alert(
        'Success',
        `Your equipment has been listed for ${listingType === 'rental' ? 'rent' : 'sale'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearForm(); // Clear the form on success
              router.push('/');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error adding listing: ', error);
      if (error instanceof z.ZodError) {
        Alert.alert(
          'Validation Error',
          `Listing data invalid: ${error.errors.map((err) => err.message).join(', ')}`,
        );
      } else {
        Alert.alert('Error', 'Failed to add listing. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back to previous screen"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={HEADER_TEXT_COLOR}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>List New Equipment</Text>
          <Text style={styles.headerDescription}>
            Fill in the details to list your equipment
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Listing Type Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Listing Purpose</Text>
            <View style={styles.smallOptionContainer}>
              {/* Use new style for smaller buttons */}
              <TouchableOpacity
                style={[
                  styles.smallOptionButton, // Use new style
                  listingType === 'rental' && styles.smallOptionButtonActive,
                ]}
                onPress={() => setListingType('rental')}
              >
                <Text
                  style={[
                    styles.smallOptionText, // Use new style
                    listingType === 'rental' && styles.smallOptionTextActive,
                  ]}
                >
                  For Rent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.smallOptionButton, // Use new style
                  listingType === 'sale' && styles.smallOptionButtonActive,
                ]}
                onPress={() => setListingType('sale')}
              >
                <Text
                  style={[
                    styles.smallOptionText, // Use new style
                    listingType === 'sale' && styles.smallOptionTextActive,
                  ]}
                >
                  For Sale
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Equipment Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Equipment Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Deere 6155R"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.photoUploadContainer}>
            <TouchableOpacity 
              style={styles.photoUploadButton}
              onPress={handleAddPhoto}
            >
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Feather name="camera" size={40} color="#6B7280" />
                  <Text style={styles.photoUploadText}>Add Photos *</Text>
                </>
              )}
            </TouchableOpacity>
            {image && (
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={handleAddPhoto}
              >
                <Feather name="edit" size={16} color="#FFFFFF" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Equipment Type Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Equipment Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.smallOptionContainer}
            >
              {equipmentTypes.map((equipType) => (
                <TouchableOpacity
                  key={equipType}
                  style={[
                    styles.smallOptionButton,
                    type === equipType && styles.smallOptionButtonActive,
                  ]}
                  onPress={() => setType(equipType)}
                >
                  <Text
                    style={[
                      styles.smallOptionText,
                      type === equipType && styles.smallOptionTextActive,
                    ]}
                  >
                    {equipType}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Fallback for "Other" or custom input */}
            {type === 'Other' && (
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Specify other type"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={type}
                onChangeText={setType}
              />
            )}
          </View>

          {/* Make (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Make (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Deere, Massey Ferguson"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={make}
              onChangeText={setMake}
            />
          </View>

          {/* Model (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 6155R, 2600"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={model}
              onChangeText={setModel}
            />
          </View>

          {/* Year of Manufacture (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Year of Manufacture (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2020"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          {/* Power (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Power (e.g., hp, kW) (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150 hp, 110 kW"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={power}
              onChangeText={setPower}
            />
          </View>

          {/* Fuel Type (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fuel Type (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Diesel, Petrol"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={fuelType}
              onChangeText={setFuelType}
            />
          </View>

          {/* Transmission Type (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transmission Type (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Automatic, Manual, CVT"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={transmissionType}
              onChangeText={setTransmissionType}
            />
          </View>

          {/* Price */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {listingType === 'rental' ? 'Rental Price' : 'Selling Price'}
            </Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={price}
                onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Rental Unit (Conditional) */}
          {listingType === 'rental' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rental Unit</Text>
              <View style={styles.smallOptionContainer}>
                {rentalUnits.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.smallOptionButton,
                      rentalUnit === unit && styles.smallOptionButtonActive,
                    ]}
                    onPress={() => setRentalUnit(unit)}
                  >
                    <Text
                      style={[
                        styles.smallOptionText,
                        rentalUnit === unit && styles.smallOptionTextActive,
                      ]}
                    >
                      Per {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Condition (Conditional for sale listings) */}
          {listingType === 'sale' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Condition</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.smallOptionContainer}
              >
                {equipmentConditions.map((eqCondition) => (
                  <TouchableOpacity
                    key={eqCondition}
                    style={[
                      styles.smallOptionButton,
                      condition === eqCondition &&
                        styles.smallOptionButtonActive,
                    ]}
                    onPress={() => setCondition(eqCondition)}
                  >
                    <Text
                      style={[
                        styles.smallOptionText,
                        condition === eqCondition &&
                          styles.smallOptionTextActive,
                      ]}
                    >
                      {eqCondition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide details about the equipment, its features, and any unique aspects."
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 123 Farm Road, Harare"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={locationAddress}
              onChangeText={setLocationAddress}
            />
          </View>

          {/* Submit Button */}
          <Button
            text={
              submitting
                ? 'Submitting...'
                : `List Equipment ${listingType === 'rental' ? 'for Rent' : 'for Sale'}`
            }
            onPress={handleAddListing}
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
            disabled={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 30, // Adjust for SafeAreaView
    paddingBottom: 10,
    backgroundColor: MAIN_COLOR,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
    textAlign: 'left',
  },
  headerDescription: {
    fontFamily: 'Archivo-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    marginTop: 2,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 100, // Adjust for header height
    paddingBottom: Platform.OS === 'ios' ? 70 + 24 : 65 + 24, // Adjust for button and spacing
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 16,
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    backgroundColor: BACKGROUND_LIGHT_GREY,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  // New styles for smaller option buttons (replaces listingType* and typeOption*)
  smallOptionContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Removed for flexibility in spacing
    marginTop: 8,
    paddingRight: 8, // For horizontal scroll
  },
  smallOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderRadius: BORDER_RADIUS,
    marginRight: 8, // Space between buttons
    borderWidth: 1,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  smallOptionButtonActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  smallOptionText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
  },
  smallOptionTextActive: {
    color: HEADER_TEXT_COLOR,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: BORDER_RADIUS,
    backgroundColor: BACKGROUND_LIGHT_GREY,
    paddingHorizontal: 16,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  currencySymbol: {
    fontFamily: 'Archivo-Medium',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MAIN_COLOR,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: HEADER_TEXT_COLOR,
  },
   photoUploadContainer: {
    marginBottom: 20,
    position: 'relative',
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
    overflow: 'hidden',
  },
  photoUploadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePhotoText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
});