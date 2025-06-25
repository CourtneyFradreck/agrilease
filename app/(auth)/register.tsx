import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { z } from 'zod';
import { UserSchema } from '@/utils/validators';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

const BORDER_RADIUS = 10;
const MAIN_COLOR = '#4D7C0F';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const WARNING_COLOR = '#DC2626';
const LIGHT_GREEN_BACKGROUND = '#F0FDF4';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<
    'farmer' | 'equipmentOwner' | 'both'
  >('farmer');

  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [bio, setBio] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string | null;
  }>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const totalSteps = 3;

  const { register, loadingAuth } = useAuth();

  useEffect(() => {
    if (currentStep === 0) {
      fetchUserLocation();
    }
  }, [currentStep]);

  const fetchUserLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(
          'Permission to access location was denied. Please input location details manually if needed.',
        );
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());

      let geocodedAddress = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocodedAddress && geocodedAddress.length > 0) {
        setAddress(geocodedAddress[0].name || '');
        setRegion(geocodedAddress[0].region || '');
        setCountry(geocodedAddress[0].country || '');
      }
    } catch (err) {
      console.error('Error fetching location: ', err);
      setLocationError(
        'Could not get your location. Please input manually if needed.',
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    if (isSubmitting) return;

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const parsedLatitude = parseFloat(latitude);
      const parsedLongitude = parseFloat(longitude);

      const userDataForSchema: Omit<
        z.infer<typeof UserSchema>,
        'id' | 'registrationDate' | 'averageRating' | 'numberOfRatings'
      > = {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        userType: userType,
        profileImageUrl: undefined,
        location: {
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          address: address || undefined,
          region: region || undefined,
          country: country,
        },
        bio: bio || undefined,
      };

      UserSchema.omit({
        id: true,
        registrationDate: true,
        averageRating: true,
        numberOfRatings: true,
      }).parse(userDataForSchema);

      const success = await register(userDataForSchema, password);

      if (success) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          general:
            'Registration failed. Please check your details and try again.',
        }));
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          if (e.path && e.path.length > 0) {
            newErrors[e.path[e.path.length - 1]] = e.message;
          } else {
            newErrors.general = e.message;
          }
        });
        setFieldErrors(newErrors);
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          general:
            err.message || 'An unexpected error occurred during registration.',
        }));
      }
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAndProceed = () => {
    setFieldErrors({});
    let isValid = true;
    const currentErrors: { [key: string]: string } = {};

    try {
      if (currentStep === 0) {
        const tempUserData = {
          name,
          email,
          phoneNumber,
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            country,
            address: address || undefined,
            region: region || undefined,
          },
          bio: bio || undefined,
          userType: 'farmer',
        };

        UserSchema.partial()
          .omit({
            id: true,
            registrationDate: true,
            averageRating: true,
            numberOfRatings: true,
            profileImageUrl: true,
          })
          .parse(tempUserData);

        if (!name.trim()) {
          currentErrors.name = 'Full Name is required.';
          isValid = false;
        } else if (name.trim().length < 3) {
          currentErrors.name = 'Full name must be at least 3 characters.';
          isValid = false;
        }

        if (!email.trim()) {
          currentErrors.email = 'Email is required.';
          isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
          currentErrors.email = 'Please enter a valid email address.';
          isValid = false;
        }

        if (!phoneNumber.trim()) {
          currentErrors.phoneNumber = 'Phone Number is required.';
          isValid = false;
        } else if (!/^\+?[1-9]\d{9,14}$/.test(phoneNumber)) {
          currentErrors.phoneNumber =
            'Phone number must be between 10 and 15 digits, optionally starting with "+".';
          isValid = false;
        }

        if (!country.trim()) {
          currentErrors.country = 'Country is required for location.';
          isValid = false;
        }

        const parsedLat = parseFloat(latitude);
        const parsedLon = parseFloat(longitude);
        if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
          currentErrors.latitude =
            'Latitude must be a number between -90 and 90.';
          isValid = false;
        }
        if (isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
          currentErrors.longitude =
            'Longitude must be a number between -180 and 180.';
          isValid = false;
        }
      } else if (currentStep === 1) {
        if (!password) {
          currentErrors.password = 'Password is required.';
          isValid = false;
        } else if (password.length < 6) {
          currentErrors.password =
            'Password must be at least 6 characters long.';
          isValid = false;
        }

        if (!confirmPassword) {
          currentErrors.confirmPassword = 'Confirm Password is required.';
          isValid = false;
        } else if (password !== confirmPassword) {
          currentErrors.confirmPassword = 'Passwords do not match.';
          isValid = false;
        }
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          if (e.path && e.path.length > 0) {
            currentErrors[e.path[e.path.length - 1]] = e.message;
          } else {
            currentErrors.general = e.message;
          }
        });
      } else {
        currentErrors.general =
          err.message || 'An unknown validation error occurred.';
      }
      isValid = false;
    }

    setFieldErrors(currentErrors);

    if (isValid) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleRegister();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setFieldErrors({});
      setLocationError(null);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, fieldErrors.name && styles.inputError]}
                placeholder="e.g., John Doe"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={name}
                onChangeText={setName}
                editable={!isSubmitting}
              />
              {fieldErrors.name && (
                <Text style={styles.inlineErrorText}>{fieldErrors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                placeholder="e.g., john.doe@example.com"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
              {fieldErrors.email && (
                <Text style={styles.inlineErrorText}>{fieldErrors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.phoneNumber && styles.inputError,
                ]}
                placeholder="e.g., +263771234567"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
              {fieldErrors.phoneNumber && (
                <Text style={styles.inlineErrorText}>
                  {fieldErrors.phoneNumber}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Details</Text>
              {locationLoading ? (
                <View style={styles.locationLoading}>
                  <ActivityIndicator size="small" color={MAIN_COLOR} />
                  <Text style={styles.locationLoadingText}>
                    Getting your location...
                  </Text>
                </View>
              ) : locationError ? (
                <View style={styles.locationErrorContainer}>
                  <Text style={styles.inlineErrorText}>{locationError}</Text>
                  <TouchableOpacity
                    onPress={fetchUserLocation}
                    style={styles.retryLocationButton}
                  >
                    <Feather name="refresh-cw" size={16} color={MAIN_COLOR} />
                    <Text style={styles.retryLocationText}>Retry Location</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.locationInfoText}>
                  Location auto-detected. You can refine manually below.
                </Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Street Address (Optional)"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={address}
                onChangeText={setAddress}
                editable={!isSubmitting}
              />
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Region / Province (Optional)"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={region}
                onChangeText={setRegion}
                editable={!isSubmitting}
              />
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.country && styles.inputError,
                  { marginTop: 10 },
                ]}
                placeholder="Country *"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={country}
                onChangeText={setCountry}
                editable={!isSubmitting}
              />
              {fieldErrors.country && (
                <Text style={styles.inlineErrorText}>
                  {fieldErrors.country}
                </Text>
              )}

              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput,
                  fieldErrors.latitude && styles.inputError,
                  { marginTop: 10 },
                ]}
                value={latitude ? `Latitude: ${latitude}` : ''}
                editable={false}
              />
              {fieldErrors.latitude && (
                <Text style={styles.inlineErrorText}>
                  {fieldErrors.latitude}
                </Text>
              )}

              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput,
                  fieldErrors.longitude && styles.inputError,
                  { marginTop: 10 },
                ]}
                value={longitude ? `Longitude: ${longitude}` : ''}
                editable={false}
              />
              {fieldErrors.longitude && (
                <Text style={styles.inlineErrorText}>
                  {fieldErrors.longitude}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>
          </>
        );
      case 1:
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.password && styles.inputError,
                ]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                editable={!isSubmitting}
              />
              {fieldErrors.password && (
                <Text style={styles.inlineErrorText}>
                  {fieldErrors.password}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.confirmPassword && styles.inputError,
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
                editable={!isSubmitting}
              />
              {fieldErrors.confirmPassword && (
                <Text style={styles.inlineErrorText}>
                  {fieldErrors.confirmPassword}
                </Text>
              )}
            </View>
          </>
        );
      case 2:
        return (
          <View style={styles.userTypeSelectionGroup}>
            <Text style={styles.label}>I am a: *</Text>
            <View style={styles.userTypeCardsContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeCard,
                  userType === 'farmer' ? styles.userTypeCardActive : undefined,
                ]}
                onPress={() => setUserType('farmer')}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <Feather
                  name="user"
                  size={30}
                  color={
                    userType === 'farmer' ? MAIN_COLOR : TEXT_SECONDARY_GREY
                  }
                />
                <Text
                  style={[
                    styles.userTypeCardTitle,
                    userType === 'farmer'
                      ? styles.userTypeCardTextActive
                      : undefined,
                  ]}
                >
                  Farmer (Renter)
                </Text>
                <Text style={styles.userTypeCardDescription}>
                  Rent equipment for your farming operations.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeCard,
                  userType === 'equipmentOwner'
                    ? styles.userTypeCardActive
                    : undefined,
                ]}
                onPress={() => setUserType('equipmentOwner')}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <Feather
                  name="tool"
                  size={30}
                  color={
                    userType === 'equipmentOwner'
                      ? MAIN_COLOR
                      : TEXT_SECONDARY_GREY
                  }
                />
                <Text
                  style={[
                    styles.userTypeCardTitle,
                    userType === 'equipmentOwner'
                      ? styles.userTypeCardTextActive
                      : undefined,
                  ]}
                >
                  Equipment Owner
                </Text>
                <Text style={styles.userTypeCardDescription}>
                  List and rent out your own agricultural equipment.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeCard,
                  userType === 'both' ? styles.userTypeCardActive : undefined,
                ]}
                onPress={() => setUserType('both')}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <Feather
                  name="repeat"
                  size={30}
                  color={userType === 'both' ? MAIN_COLOR : TEXT_SECONDARY_GREY}
                />
                <Text
                  style={[
                    styles.userTypeCardTitle,
                    userType === 'both'
                      ? styles.userTypeCardTextActive
                      : undefined,
                  ]}
                >
                  Both
                </Text>
                <Text style={styles.userTypeCardDescription}>
                  Access both roles: rent equipment and list yours.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (loadingAuth && !isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text style={styles.loadingText}>Setting up your account...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
              Join our community to easily rent or list agricultural equipment.
              Fill in your details below to get started.
            </Text>

            {fieldErrors.general && (
              <Text style={styles.generalErrorText}>{fieldErrors.general}</Text>
            )}

            {renderStepContent()}

            <View style={styles.navigationButtons}>
              {currentStep > 0 && (
                <Button
                  text="Previous"
                  onPress={handlePrevious}
                  style={styles.previousButton}
                  textStyle={styles.previousButtonText}
                  disabled={isSubmitting}
                />
              )}
              <Button
                text={
                  currentStep === totalSteps - 1
                    ? isSubmitting
                      ? 'Creating Account...'
                      : 'Create Account'
                    : 'Next'
                }
                onPress={validateAndProceed}
                style={[
                  styles.nextButton,
                  currentStep === 0 ? styles.nextButtonFullWidth : undefined,
                  currentStep === totalSteps - 1
                    ? styles.finalButton
                    : undefined,
                  isSubmitting ? styles.disabledButton : undefined,
                ]}
                disabled={isSubmitting}
              />
            </View>

            {isSubmitting && (
              <View style={styles.submittingContainer}>
                <ActivityIndicator size="small" color={MAIN_COLOR} />
                <Text style={styles.submittingText}>
                  Creating your account, please wait...
                </Text>
              </View>
            )}

            <View style={styles.progressIndicatorContainer}>
              {[...Array(totalSteps)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.activeProgressDot,
                  ]}
                />
              ))}
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity activeOpacity={0.7} disabled={isSubmitting}>
                  <Text
                    style={[
                      styles.loginLink,
                      isSubmitting && styles.disabledLink,
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  contentWrapper: {
    marginTop: 30,
    width: '100%',
    maxWidth: 450,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Archivo-Bold',
    fontSize: 28,
    color: TEXT_PRIMARY_DARK,
    textAlign: 'left',
    width: '100%',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'left',
    marginBottom: 30,
    width: '100%',
    lineHeight: 24,
  },
  generalErrorText: {
    fontFamily: 'Archivo-Regular',
    color: WARNING_COLOR,
    marginBottom: 20,
    textAlign: 'left',
    fontSize: 15,
    width: '100%',
  },
  inlineErrorText: {
    fontFamily: 'Archivo-Regular',
    color: WARNING_COLOR,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 10,
    textAlign: 'left',
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 16,
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    backgroundColor: CARD_BACKGROUND,
    textAlign: 'left',
  },
  inputError: {
    borderColor: WARNING_COLOR,
  },
  disabledInput: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    color: TEXT_SECONDARY_GREY,
    borderStyle: 'dashed',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: LIGHT_GREEN_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    marginBottom: 10,
  },
  locationLoadingText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: MAIN_COLOR,
    marginLeft: 10,
  },
  locationErrorContainer: {
    padding: 10,
    backgroundColor: '#FFE5E5',
    borderRadius: BORDER_RADIUS,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  retryLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: MAIN_COLOR,
  },
  retryLocationText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 12,
    color: MAIN_COLOR,
    marginLeft: 5,
  },
  locationInfoText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 10,
  },
  userTypeSelectionGroup: {
    marginBottom: 20,
    width: '100%',
  },
  userTypeCardsContainer: {
    flexDirection: 'column',
    gap: 15,
    width: '100%',
  },
  userTypeCard: {
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  userTypeCardActive: {
    borderColor: MAIN_COLOR,
    backgroundColor: LIGHT_GREEN_BACKGROUND,
  },
  userTypeCardTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16, // Smaller font size
    color: TEXT_PRIMARY_DARK,
    marginTop: 8, // Adjusted margin
    marginBottom: 3, // Adjusted margin
    textAlign: 'center',
  },
  userTypeCardTextActive: {
    color: MAIN_COLOR,
  },
  userTypeCardDescription: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12, // Smaller font size
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    lineHeight: 18, // Adjusted line height
  },
  userTypeButton: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
  },
  userTypeButtonActive: {
    borderColor: MAIN_COLOR,
    backgroundColor: LIGHT_GREEN_BACKGROUND,
  },
  userTypeButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
  },
  userTypeButtonTextActive: {
    color: MAIN_COLOR,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    width: '100%',
  },
  previousButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: CARD_BACKGROUND,
    borderColor: BORDER_GREY,
    borderWidth: 1,
  },
  previousButtonText: {
    color: TEXT_PRIMARY_DARK,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
  },
  nextButtonFullWidth: {
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
  },
  finalButton: {
    backgroundColor: MAIN_COLOR,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    width: '100%',
  },
  submittingText: {
    marginLeft: 10,
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
  },
  progressIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: '100%',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BORDER_GREY,
    marginHorizontal: 5,
  },
  activeProgressDot: {
    backgroundColor: MAIN_COLOR,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  loginText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
  },
  loginLink: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: MAIN_COLOR,
    textDecorationLine: 'underline',
  },
  disabledLink: {
    opacity: 0.5,
  },
});

