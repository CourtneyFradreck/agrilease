import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import firestore from '@react-native-firebase/firestore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'farmer' | 'owner'>('farmer');
  const [error, setError] = useState<string | null>(null);

  // Firebase Firestore instance
 
  //const usersCollection = firestore().collection('users');
  //const userCollection = usersCollection.get();
  //console.log(userCollection);

  const { register } = useAuth();

const handleRegister = async () => {
  // Basic validation
  if (!name || !email || !phone || !password || !confirmPassword) {
    setError('All fields are required');
    return;
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    const success = await register(name, email, phone, password, userType);
    if (success) {
      // Save user data to Firestore
      await firestore().collection('users').add({
        name,
        email,
        phone,
        userType,
        createdAt: firestore.FieldValue.serverTimestamp(), // Optional: track when the user was created
      });

      // Navigate to the main application
      router.replace('/(tabs)');
    } else {
      setError('Registration failed. Please try again.');
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    setError('An error occurred during registration');
  }
};
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#A3A3A3"
              value={name}
              onChangeText={setName}
            />
          </View>
          
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
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#A3A3A3"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#A3A3A3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#A3A3A3"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>I am a:</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'farmer' && styles.userTypeButtonActive
                ]}
                onPress={() => setUserType('farmer')}
              >
                <Text style={[
                  styles.userTypeText,
                  userType === 'farmer' && styles.userTypeTextActive
                ]}>Farmer (Renter)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'owner' && styles.userTypeButtonActive
                ]}
                onPress={() => setUserType('owner')}
              >
                <Text style={[
                  styles.userTypeText,
                  userType === 'owner' && styles.userTypeTextActive
                ]}>Equipment Owner</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Button onPress={handleRegister} text="Register" style={styles.registerButton} />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
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
    paddingVertical: 40,
  },
  formContainer: {
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
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
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 4,
  },
  userTypeButtonActive: {
    borderColor: '#4D7C0F',
    backgroundColor: '#F0FDF4',
  },
  userTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
  userTypeTextActive: {
    color: '#4D7C0F',
  },
  registerButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4B5563',
  },
  loginLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4D7C0F',
  },
});