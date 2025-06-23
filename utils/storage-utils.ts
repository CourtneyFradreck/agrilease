import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { doc, updateDoc } from "firebase/firestore"
import { storage, db } from "../config/firebase"

export interface UploadResult {
  url: string
  path: string
}

export async function uploadImage(
  uri: string,
  folder: "profiles" | "equipment",
  userId: string,
  itemId?: string,
): Promise<UploadResult> {
  try {
    // Fetch the image as a blob
    const response = await fetch(uri)
    const blob = await response.blob()

    // Create a unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-image.jpg`

    // Create storage reference
    const storageRef = ref(storage, `${folder}/${userId}/${fileName}`)

    // Upload file
    const snapshot = await uploadBytes(storageRef, blob)

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const imageRef = ref(storage, imagePath)
    await deleteObject(imageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}

export async function updateProfileImage(userId: string, imageUrl: string, imagePath: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      profileImage: imageUrl,
      profileImagePath: imagePath,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating profile image:", error)
    throw new Error("Failed to update profile image")
  }
}

export async function updateEquipmentImages(
  equipmentId: string,
  images: Array<{ url: string; path: string }>,
): Promise<void> {
  try {
    const equipmentRef = doc(db, "equipment", equipmentId)
    await updateDoc(equipmentRef, {
      images: images,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating equipment images:", error)
    throw new Error("Failed to update equipment images")
  }
}
