import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E0E0E0';
const WARNING_COLOR = '#DC2626';
const HEADER_TEXT_COLOR = '#FFFFFF';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login component caught error:', err);
      Alert.alert(
        'Login Error',
        'An unexpected error occurred during login. Please try again.',
      );
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
            }}
            style={styles.logoBackground}
          />
          <View style={styles.logoOverlay}>
            <Text style={styles.logoText}>AgriLease</Text>
            <Text style={styles.tagline}>
              Farm Equipment Rental Marketplace
            </Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.descriptionText}>
            Sign in to access your account and manage your equipment listings or
            rentals.
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={TEXT_SECONDARY_GREY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isSubmitting}
            />
          </View>

          <Button
            onPress={handleLogin}
            text={isSubmitting ? 'Signing In...' : 'Sign In'}
            style={styles.loginButton}
            disabled={isSubmitting}
          />

          {isSubmitting && (
            <View style={styles.submittingContainer}>
              <ActivityIndicator size="small" color={MAIN_COLOR} />
              <Text style={styles.submittingText}>
                Authenticating, please wait...
              </Text>
            </View>
          )}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity disabled={isSubmitting}>
                <Text
                  style={[
                    styles.registerLink,
                    isSubmitting && styles.disabledLink,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    height: 220,
    position: 'relative',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 38,
    color: HEADER_TEXT_COLOR,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: HEADER_TEXT_COLOR,
    textAlign: 'center', // Changed to center for better visual balance
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: CARD_BACKGROUND,
    borderTopLeftRadius: BORDER_RADIUS * 2,
    borderTopRightRadius: BORDER_RADIUS * 2,
    marginTop: -30,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
  },
  title: {
    fontFamily: 'Archivo-SemiBold', // Less bold as requested
    fontSize: 28,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
    textAlign: 'left',
  },
  descriptionText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'left',
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Archivo-Regular',
    color: WARNING_COLOR,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Archivo-Medium',
    fontSize: 15,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
  },
  input: {
    height: 52, // Retained original height
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 16,
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 15, // Adjusted to match register form button padding
    height: 54, // Ensured consistent height with register form buttons
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    color: TEXT_SECONDARY_GREY,
  },
  registerLink: {
    fontFamily: 'Archivo-Medium',
    fontSize: 15,
    color: MAIN_COLOR,
    textDecorationLine: 'underline',
  },
  disabledLink: {
    opacity: 0.5,
  },
});
