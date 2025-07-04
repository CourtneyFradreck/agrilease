import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { doc, updateDoc } from "firebase/firestore"
import { storage, db } from "../FirebaseConfig"

export interface UploadResult {
  url: string
  path: string
}

export const uploadImage = async (
  uri: string,
  folder: string,
  userId: string,
  equipmentId?: string,
): Promise<UploadResult> => {
  try {
    // Convert URI to blob for upload
    const response = await fetch(uri)
    const blob = await response.blob()

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}_${Math.random().toString(36).substring(7)}.jpg`
    const path = `${folder}/${userId}/${equipmentId || "profile"}/${filename}`

    // Create storage reference and upload
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, blob)

    // Get download URL
    const url = await getDownloadURL(storageRef)

    return { url, path }
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Delete error:", error)
    throw error
  }
}

export const updateProfileImage = async (userId: string, imageUrl: string, imagePath: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      profileImage: imageUrl,
      profileImagePath: imagePath,
    })
  } catch (error) {
    console.error("Error updating profile image:", error)
    throw error
  }
}

export const updateEquipmentImages = async (
  equipmentId: string,
  images: Array<{ url: string; path: string }>,
): Promise<void> => {
  try {
    const equipmentRef = doc(db, "rentalEquipment", equipmentId)
    await updateDoc(equipmentRef, {
      images: images,
      mainImage: images.length > 0 ? images[0].url : null,
    })
  } catch (error) {
    console.error("Error updating equipment images:", error)
    throw error
  }
}

// NEW: Function to update marketplace item images
export const updateMarketplaceImages = async (
  itemId: string,
  images: { url: string; path: string }[],
): Promise<void> => {
  try {
    const itemRef = doc(db, "marketplaceItems", itemId)
    await updateDoc(itemRef, {
      images: images,
      mainImage: images.length > 0 ? images[0].url : null,
      mainImagePath: images.length > 0 ? images[0].path : null,
    })
  } catch (error) {
    console.error("Error updating marketplace item images in Firestore:", error)
    throw error
  }
}
