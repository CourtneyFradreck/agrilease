"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator, FlatList } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import { uploadImage, updateEquipmentImages, deleteImage } from "../utils/storage-utils"

interface EquipmentImage {
  url: string
  path: string
}

interface EquipmentImageUploadProps {
  equipmentId: string
  userId: string
  currentImages?: EquipmentImage[]
  maxImages?: number
  onImagesUpdate?: (images: EquipmentImage[]) => void
}

export default function EquipmentImageUpload({
  equipmentId,
  userId,
  currentImages = [],
  maxImages = 5,
  onImagesUpdate,
}: EquipmentImageUploadProps) {
  const [images, setImages] = useState<EquipmentImage[]>(currentImages)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.")
      return false
    }
    return true
  }

  const pickImages = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    if (images.length >= maxImages) {
      Alert.alert("Limit reached", `You can only upload up to ${maxImages} images`)
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages - images.length,
      })

      if (!result.canceled && result.assets.length > 0) {
        await handleImageUpload(result.assets.map((asset) => asset.uri))
      }
    } catch (error) {
      console.error("Error picking images:", error)
      Alert.alert("Error", "Failed to pick images")
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera permissions to take photos.")
      return
    }

    if (images.length >= maxImages) {
      Alert.alert("Limit reached", `You can only upload up to ${maxImages} images`)
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload([result.assets[0].uri])
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo")
    }
  }

  const handleImageUpload = async (uris: string[]) => {
    setIsUploading(true)
    const newImages: EquipmentImage[] = []

    try {
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i]
        setUploadProgress(`Uploading ${i + 1} of ${uris.length}...`)

        const result = await uploadImage(uri, "equipment", userId, equipmentId)
        newImages.push(result)
      }

      const updatedImages = [...images, ...newImages]

      // Update Firestore document
      await updateEquipmentImages(equipmentId, updatedImages)

      // Update local state
      setImages(updatedImages)
      onImagesUpdate?.(updatedImages)

      Alert.alert("Success", `${uris.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error("Upload error:", error)

      // Clean up any uploaded images on error
      for (const image of newImages) {
        try {
          await deleteImage(image.path)
        } catch (deleteError) {
          console.error("Error cleaning up image:", deleteError)
        }
      }

      Alert.alert("Error", "Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]

    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            // Delete from storage
            await deleteImage(imageToRemove.path)

            // Update local state
            const updatedImages = images.filter((_, i) => i !== index)
            setImages(updatedImages)

            // Update Firestore
            await updateEquipmentImages(equipmentId, updatedImages)
            onImagesUpdate?.(updatedImages)

            Alert.alert("Success", "Image removed successfully")
          } catch (error) {
            console.error("Delete error:", error)
            Alert.alert("Error", "Failed to remove image. Please try again.")
          }
        },
      },
    ])
  }

  const showImageOptions = () => {
    Alert.alert("Add Images", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImages },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const renderImage = ({ item, index }: { item: EquipmentImage; index: number }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item.url }} style={styles.equipmentImage} />
      <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)} disabled={isUploading}>
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  )

  const canUploadMore = images.length < maxImages

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Equipment Images ({images.length}/{maxImages})
        </Text>
      </View>

      {canUploadMore && (
        <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions} disabled={isUploading}>
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.uploadButtonText}>{uploadProgress || "Uploading..."}</Text>
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.uploadButtonText}>Add Images</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {images.length > 0 && (
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item, index) => `${item.path}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.imageGrid}
          scrollEnabled={false}
        />
      )}

      <Text style={styles.guidelines}>
        • Supported formats: JPG, PNG{"\n"}• Maximum {maxImages} images per equipment{"\n"}• Images will be compressed
        automatically{"\n"}• You can select multiple images at once
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  imageGrid: {
    marginBottom: 16,
  },
  imageItem: {
    flex: 1,
    margin: 4,
    position: "relative",
  },
  equipmentImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  guidelines: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
})
