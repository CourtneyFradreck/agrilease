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
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, firebaseConfig } from '@/FirebaseConfig';
import { EquipmentSchema, ListingSchema } from '@/utils/validators';
import z from 'zod';
import { MaterialIcons } from '@expo/vector-icons';

type ListingType = 'rental' | 'sale';
type RentalUnit = 'day' | 'week' | 'month';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB'; // This is currently used for input backgrounds and some buttons
const CARD_BACKGROUND = '#FFFFFF'; // This is the desired page background now
const BORDER_GREY = '#E5E5E5';

export default function AddListing() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [listingType, setListingType] = useState<ListingType>('rental');
  const [rentalUnit, setRentalUnit] = useState<RentalUnit>('day');

  const [condition, setCondition] = useState('');
  const [year, setYear] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const equipmentTypes = [
    'Tractor',
    'Harvester',
    'Seeder',
    'Sprayer',
    'Tillage',
    'Irrigation',
    'Other',
  ];

  const handleTypeSelection = (selectedType: string) => {
    setType(selectedType);
  };

  const handleAddListing = async () => {
    if (!name || !type || !price || !description || !location) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid positive price.');
      return;
    }

    const yearValue = year ? parseInt(year) : undefined;
    if (
      year &&
      (isNaN(yearValue!) ||
        yearValue! < 1900 ||
        yearValue! > new Date().getFullYear() + 5)
    ) {
      Alert.alert('Invalid Year', 'Please enter a valid manufacturing year.');
      return;
    }

    if (listingType === 'rental' && !rentalUnit) {
      Alert.alert(
        'Missing Information',
        'Please select a rental unit (e.g., Day, Week).',
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
        setSubmitting(false);
        return;
      }

      const newEquipmentData: Omit<z.infer<typeof EquipmentSchema>, 'id'> = {
        name,
        type,
        make: make || '',
        model: model || '',
        yearOfManufacture: yearValue,
        images: [],
        ownerId: currentUserId,
        description,
        condition: condition
          ? (condition as z.infer<typeof EquipmentSchema>['condition'])
          : 'Fair',
        currentLocation: { latitude: 0, longitude: 0 },
        lastUpdatedAt: Date.now(),
      };

      const equipmentCollectionRef = collection(db, `equipment`);
      const equipmentDocRef = await addDoc(
        equipmentCollectionRef,
        newEquipmentData,
      );
      const equipmentId = equipmentDocRef.id;

      const newListingData: Omit<z.infer<typeof ListingSchema>, 'id'> = {
        equipmentId,
        ownerId: currentUserId,
        listingType: listingType === 'rental' ? 'rent' : 'sell',
        status: 'active',
        price: priceValue,
        rentalUnit: listingType === 'rental' ? rentalUnit : undefined,
        availabilityStartDate: Date.now(),
        availabilityEndDate:
          listingType === 'rental'
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : undefined,
        createdAt: Date.now(),
        listingLocation: { latitude: 0, longitude: 0 },
        negotiable: false,
        views: 0,
      };

      const listingsCollectionRef = collection(db, `listings`);
      await addDoc(listingsCollectionRef, newListingData);

      Alert.alert(
        'Success',
        `Your equipment has been listed for ${listingType === 'rental' ? 'rent' : 'sale'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.push('/');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error adding listing: ', error);
      Alert.alert('Error', 'Failed to add listing. Please try again.');
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
          {/* Inputs rendered directly on the page, not inside a card */}
          <View style={styles.listingTypeContainer}>
            <Text style={styles.listingTypeLabel}>Listing Type:</Text>
            <View style={styles.listingTypeOptions}>
              <TouchableOpacity
                style={[
                  styles.listingTypeButton,
                  listingType === 'rental' && styles.listingTypeButtonActive,
                ]}
                onPress={() => setListingType('rental')}
              >
                <Text
                  style={[
                    styles.listingTypeText,
                    listingType === 'rental' && styles.listingTypeTextActive,
                  ]}
                >
                  For Rent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.listingTypeButton,
                  listingType === 'sale' && styles.listingTypeButtonActive,
                ]}
                onPress={() => setListingType('sale')}
              >
                <Text
                  style={[
                    styles.listingTypeText,
                    listingType === 'sale' && styles.listingTypeTextActive,
                  ]}
                >
                  For Sale
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Equipment Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter equipment name"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Equipment Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="Select or enter equipment type"
              placeholderTextColor={TEXT_SECONDARY_GREY}
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
                    type === equipType && styles.typeOptionActive,
                  ]}
                  onPress={() => handleTypeSelection(equipType)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      type === equipType && styles.typeOptionTextActive,
                    ]}
                  >
                    {equipType}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Make</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Deere, Massey Ferguson"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={make}
              onChangeText={setMake}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 6155R, 2600"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={model}
              onChangeText={setModel}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter manufacturing year"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {listingType === 'rental' ? 'Rental Price *' : 'Selling Price *'}
            </Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {listingType === 'rental' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rental Unit *</Text>
              <View style={styles.rentalUnitOptions}>
                <TouchableOpacity
                  style={[
                    styles.rentalUnitButton,
                    rentalUnit === 'day' && styles.rentalUnitButtonActive,
                  ]}
                  onPress={() => setRentalUnit('day')}
                >
                  <Text
                    style={[
                      styles.rentalUnitText,
                      rentalUnit === 'day' && styles.rentalUnitTextActive,
                    ]}
                  >
                    Per Day
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.rentalUnitButton,
                    rentalUnit === 'week' && styles.rentalUnitButtonActive,
                  ]}
                  onPress={() => setRentalUnit('week')}
                >
                  <Text
                    style={[
                      styles.rentalUnitText,
                      rentalUnit === 'week' && styles.rentalUnitTextActive,
                    ]}
                  >
                    Per Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.rentalUnitButton,
                    rentalUnit === 'month' && styles.rentalUnitButtonActive,
                  ]}
                  onPress={() => setRentalUnit('month')}
                >
                  <Text
                    style={[
                      styles.rentalUnitText,
                      rentalUnit === 'month' && styles.rentalUnitTextActive,
                    ]}
                  >
                    Per Month
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {listingType === 'sale' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Condition *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Excellent, Good, Fair"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={condition}
                onChangeText={setCondition}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide details about the equipment"
              placeholderTextColor={TEXT_SECONDARY_GREY}
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
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={location}
              onChangeText={setLocation}
            />
          </View>

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
    backgroundColor: CARD_BACKGROUND, // Page background is now white
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 30,
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
    paddingHorizontal: 18, // Consistent horizontal padding
    paddingTop: Platform.OS === 'android' ? 85 : 95, // Adjusted to compensate for fixed header
    paddingBottom: Platform.OS === 'ios' ? 70 + 24 : 65 + 24, // Adjusted for tab bar + button padding
  },
  // Removed formContainer style as inputs are now direct children
  inputSection: {
    // This style is now effectively gone, as the inputs are direct children of the ScrollView
    // The individual inputContainer styles will handle spacing.
  },
  listingTypeContainer: {
    marginBottom: 20,
    marginTop: 10, // Add some top margin to the first element
  },
  listingTypeLabel: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
    textAlign: 'left',
  },
  listingTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingTypeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: BACKGROUND_LIGHT_GREY, // Use light grey for these buttons
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  listingTypeButtonActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  listingTypeText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
  },
  listingTypeTextActive: {
    color: HEADER_TEXT_COLOR,
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
    backgroundColor: BACKGROUND_LIGHT_GREY, // Use light grey for input background
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
  typeOptionsContainer: {
    marginTop: 8,
    maxHeight: 44,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BACKGROUND_LIGHT_GREY, // Use light grey for these options
    borderRadius: BORDER_RADIUS,
    marginRight: 8,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  typeOptionActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  typeOptionText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
  },
  typeOptionTextActive: {
    color: HEADER_TEXT_COLOR,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: BORDER_RADIUS,
    backgroundColor: BACKGROUND_LIGHT_GREY, // Use light grey for price input background
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
  rentalUnitOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rentalUnitButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: BACKGROUND_LIGHT_GREY, // Use light grey for these buttons
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  rentalUnitButtonActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  rentalUnitText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
  },
  rentalUnitTextActive: {
    color: HEADER_TEXT_COLOR,
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
});
