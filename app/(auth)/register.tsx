import React, { useState } from 'react';
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
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

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
  const [fullname, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'farmer' | 'owner'>('farmer');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  const { register } = useAuth();

  const handleRegister = async () => {
    setError(null);

    try {
      const success = await register(
        fullname,
        email,
        phone,
        password,
        userType,
      );
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError(
          'Registration failed. Please check your details and try again.',
        );
      }
    } catch (err) {
      setError(
        (err as Error).message ||
          'An unexpected error occurred during registration.',
      );
      console.error('Registration error:', err);
    }
  };

  const validateAndProceed = () => {
    setError(null);
    let isValid = true;

    if (currentStep === 0) {
      if (!fullname || !email || !phone) {
        setError('All personal information fields are required.');
        isValid = false;
      } else if (fullname.trim().length < 3) {
        setError('Full name must be at least 3 letters.');
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('Please enter a valid email address.');
        isValid = false;
      } else if (!/^\d{10}$/.test(phone)) {
        setError('Phone number must be exactly 10 digits.');
        isValid = false;
      }
    } else if (currentStep === 1) {
      if (!password || !confirmPassword) {
        setError('Both password fields are required.');
        isValid = false;
      } else if (password !== confirmPassword) {
        setError('Passwords do not match.');
        isValid = false;
      } else if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        isValid = false;
      }
    }

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
      setError(null);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={fullname}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Your email address"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Your phone number"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </>
        );
      case 1:
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={TEXT_SECONDARY_GREY}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>
          </>
        );
      case 2:
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>I am a:</Text>
            <View style={styles.userTypeSelectorContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'farmer' && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType('farmer')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    userType === 'farmer' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Farmer (Renter)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'owner' && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType('owner')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    userType === 'owner' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Equipment Owner
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

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

            {error && <Text style={styles.errorText}>{error}</Text>}

            {renderStepContent()}

            <View style={styles.navigationButtons}>
              {currentStep > 0 && (
                <Button
                  text="Previous"
                  onPress={handlePrevious}
                  style={styles.previousButton}
                  textStyle={styles.previousButtonText}
                />
              )}
              <Button
                text={
                  currentStep === totalSteps - 1 ? 'Create Account' : 'Next'
                }
                onPress={validateAndProceed}
                style={[
                  styles.nextButton,
                  currentStep === 0 && styles.nextButtonFullWidth,
                  currentStep === totalSteps - 1 && styles.finalButton,
                ]}
              />
            </View>

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
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.loginLink}>Sign In</Text>
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
  errorText: {
    fontFamily: 'Archivo-Regular',
    color: WARNING_COLOR,
    marginBottom: 20,
    textAlign: 'left',
    fontSize: 15,
    width: '100%',
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
  userTypeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
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
});
