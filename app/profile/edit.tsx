import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/utils/storage-utils';
import { Button } from '@/components/Button';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/?d=mp';

export default function EditProfileScreen() {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [address, setAddress] = useState(currentUser?.location.address || '');
  const [region, setRegion] = useState(currentUser?.location.region || '');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const chooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && currentUser?.id) {
      setUploading(true);
      try {
        const { url } = await uploadImage(result.assets[0].uri, "profile_images", currentUser.id);
        await updateProfileImage(url);
        Alert.alert('Success', 'Profile image updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    try {
      const success = await updateProfile({ profileImageUrl: imageUrl });
      if (!success) {
        throw new Error('Failed to update profile image');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateProfile({ name, location: { address, region } });
      if (success) {
        Alert.alert('Success', 'Profile updated successfully!');
        router.back();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Save Failed', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={HEADER_TEXT_COLOR} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerDescription}>
            Update your profile details below.
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentUser?.profileImageUrl || DEFAULT_PROFILE_IMAGE }}
            style={styles.profileImage}
          />
          <TouchableOpacity onPress={chooseImage} style={styles.imageOverlay}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
          />
        </View>
        
        {/* Add other input fields here */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Your Address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Region</Text>
          <TextInput
            style={styles.input}
            value={region}
            onChangeText={setRegion}
            placeholder="Your Region"
          />
        </View>

        <Button
          text={saving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
          disabled={saving || uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MAIN_COLOR,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
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
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: MAIN_COLOR,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
  },
  saveButton: {
    width: '100%',
    backgroundColor: MAIN_COLOR,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: HEADER_TEXT_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
