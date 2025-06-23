"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import { uploadImage, updateProfileImage, deleteImage } from "../utils/storage-utils"

interface ProfileImageUploadProps {
  userId: string
  currentImageUrl?: string
  currentImagePath?: string
  onImageUpdate?: (imageUrl: string, imagePath: string) => void
}

export default function ProfileImageUpload({
  userId,
  currentImageUrl,
  currentImagePath,
  onImageUpdate,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUri, setImageUri] = useState<string | null>(currentImageUrl || null)

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.")
      return false
    }
    return true
  }

  const pickImage = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera permissions to take photos.")
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo")
    }
  }

  const handleImageUpload = async (uri: string) => {
    setIsUploading(true)

    try {
      // Delete old image if exists
      if (currentImagePath) {
        await deleteImage(currentImagePath)
      }

      // Upload new image
      const result = await uploadImage(uri, "profiles", userId)

      // Update Firestore document
      await updateProfileImage(userId, result.url, result.path)

      // Update local state
      setImageUri(result.url)
      onImageUpdate?.(result.url, result.path)

      Alert.alert("Success", "Profile image updated successfully")
    } catch (error) {
      console.error("Upload error:", error)
      Alert.alert("Error", "Failed to upload profile image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = async () => {
    if (!currentImagePath) return

    Alert.alert("Remove Image", "Are you sure you want to remove your profile image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setIsUploading(true)
          try {
            await deleteImage(currentImagePath)
            await updateProfileImage(userId, "", "")
            setImageUri(null)
            onImageUpdate?.("", "")
            Alert.alert("Success", "Profile image removed successfully")
          } catch (error) {
            console.error("Delete error:", error)
            Alert.alert("Error", "Failed to remove profile image")
          } finally {
            setIsUploading(false)
          }
        },
      },
    ])
  }

  const showImageOptions = () => {
    Alert.alert("Profile Image", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      ...(imageUri ? [{ text: "Remove Image", onPress: removeImage, style: "destructive" as const }] : []),
      { text: "Cancel", style: "cancel" },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Image</Text>

      <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions} disabled={isUploading}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={40} color="#666" />
          </View>
        )}

        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        <View style={styles.cameraIcon}>
          <Ionicons name="camera" size={20} color="white" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showImageOptions} disabled={isUploading}>
        <Text style={styles.buttonText}>{isUploading ? "Uploading..." : imageUri ? "Change Image" : "Add Image"}</Text>
      </TouchableOpacity>

      <Text style={styles.guidelines}>
        • Supported formats: JPG, PNG{"\n"}• Recommended: Square images (1:1 ratio){"\n"}• Image will be compressed
        automatically
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  guidelines: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
})
