import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(null); // Clear previous errors
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        // More specific error handling can be done here based on the actual error from login function
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (err: any) { // Catch any unexpected errors
      console.error("Login component caught error:", err);
      setError('An unexpected error occurred during login. Please try again.');
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
            source={{ uri: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg' }} 
            style={styles.logoBackground}
          />
          <View style={styles.logoOverlay}>
            <Text style={styles.logoText}>AgriLease</Text>
            <Text style={styles.tagline}>Farm Equipment Rental Marketplace</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#A3A3A3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#A3A3A3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <Button onPress={handleLogin} text="Sign In" style={styles.loginButton} />
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Register</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    height: 250,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333333',
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginBottom: 16,
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
  loginButton: {
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4B5563',
  },
  registerLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4D7C0F',
  },
});