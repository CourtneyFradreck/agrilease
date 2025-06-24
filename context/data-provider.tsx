"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { RentalEquipment, MarketplaceItem, Booking } from "@/types/equipment"
import { db } from "@/config/firebase"
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  where,
  orderBy,
} from "firebase/firestore"
import { useAuth } from "./AuthContext"

interface DataContextType {
  rentalEquipment: RentalEquipment[]
  marketplaceItems: MarketplaceItem[]
  bookings: Booking[]
  getRentalEquipmentById: (id: string) => RentalEquipment | undefined
  getMarketplaceItemById: (id: string) => MarketplaceItem | undefined
  addRentalEquipment: (
    equipment: Omit<RentalEquipment, "id" | "owner" | "rating" | "reviewCount" | "distance">,
  ) => Promise<string>
  addMarketplaceItem: (item: Omit<MarketplaceItem, "id" | "seller">) => Promise<string>
  updateRentalEquipmentImages: (equipmentId: string, images: any[]) => Promise<void>
  updateMarketplaceItemImages: (itemId: string, images: any[]) => Promise<void>
  createBooking: (booking: Omit<Booking, "id" | "status" | "createdAt">) => Promise<void>
}

const DataContext = createContext<DataContextType>({
  rentalEquipment: [],
  marketplaceItems: [],
  bookings: [],
  getRentalEquipmentById: () => undefined,
  getMarketplaceItemById: () => undefined,
  addRentalEquipment: async () => "",
  addMarketplaceItem: async () => "",
  updateRentalEquipmentImages: async () => {},
  updateMarketplaceItemImages: async () => {},
  createBooking: async () => {},
})

export const useData = () => useContext(DataContext)

interface DataProviderProps {
  children: React.ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [rentalEquipment, setRentalEquipment] = useState<RentalEquipment[]>([])
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const { currentUser, loadingAuth } = useAuth()

  // Fetch Rental Equipment from Firestore
  useEffect(() => {
    if (!db || loadingAuth) return

    const q = query(collection(db, "rentalEquipment"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const equipmentList = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name,
            type: data.type,
            description: data.description,
            rentalPrice: typeof data.rentalPrice === "number" ? data.rentalPrice : Number.parseFloat(data.rentalPrice),
            location: data.location,

            // Support both old and new image fields
            image: data.mainImage || data.image, // Use Firebase Storage URL if available
            mainImage: data.mainImage, // Firebase Storage URL
            mainImagePath: data.mainImagePath, // Firebase Storage path
            images: data.images || [], // Firebase Storage images array

            owner: data.owner,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            distance: data.distance || 0,
          } as RentalEquipment
        })
        setRentalEquipment(equipmentList)
      },
      (error) => {
        console.error("Error fetching rental equipment:", error)
      },
    )

    return () => unsubscribe()
  }, [db, loadingAuth])

  // Fetch Marketplace Items from Firestore
  useEffect(() => {
    if (!db || loadingAuth) return

    const q = query(collection(db, "marketplaceItems"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemList = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title,
            type: data.type,
            description: data.description,
            condition: data.condition,
            year: data.year,
            price: typeof data.price === "number" ? data.price : Number.parseFloat(data.price),
            location: data.location,

        
            image: data.mainImage || data.image, // Use Firebase Storage URL if available
            mainImage: data.mainImage, // Firebase Storage URL
            mainImagePath: data.mainImagePath, // Firebase Storage path
            images: data.images || [], // Firebase Storage images array

            seller: data.seller,
          } as MarketplaceItem
        })
        setMarketplaceItems(itemList)
      },
      (error) => {
        console.error("Error fetching marketplace items:", error)
      },
    )

    return () => unsubscribe()
  }, [db, loadingAuth])

  // Fetch Bookings from Firestore
  useEffect(() => {
    if (!db || loadingAuth || !currentUser?.id) {
      setBookings([])
      return
    }

    const q = query(collection(db, "bookings"), where("renterId", "==", currentUser.id), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingList = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            equipmentId: data.equipmentId,
            startDate: (data.startDate as Timestamp)?.toDate() || new Date(),
            endDate: (data.endDate as Timestamp)?.toDate() || new Date(),
            totalPrice: data.totalPrice,
            status: data.status,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          } as Booking
        })
        setBookings(bookingList)
      },
      (error) => {
        console.error("Error fetching bookings:", error)
      },
    )

    return () => unsubscribe()
  }, [db, loadingAuth, currentUser?.id])

  const getRentalEquipmentById = (id: string): RentalEquipment | undefined => {
    return rentalEquipment.find((item) => item.id === id)
  }

  const getMarketplaceItemById = (id: string): MarketplaceItem | undefined => {
    return marketplaceItems.find((item) => item.id === id)
  }

  const addRentalEquipment = async (
    equipment: Omit<RentalEquipment, "id" | "owner" | "rating" | "reviewCount" | "distance">,
  ): Promise<string> => {
    if (!currentUser) {
      console.error("Cannot add rental equipment: User not authenticated.")
      throw new Error("User not authenticated.")
    }
    try {
      const newEquipmentData = {
        ...equipment,
        owner: {
          id: currentUser.id,
          fullname: currentUser.fullname,
        },
        rating: 0,
        reviewCount: 0,
        distance: 0,
        images: [], // Initialize empty images array for Firebase Storage
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, "rentalEquipment"), newEquipmentData)
      console.log("Rental equipment added to Firestore.")
      return docRef.id
    } catch (error) {
      console.error("Error adding rental equipment:", error)
      throw error
    }
  }

  const addMarketplaceItem = async (item: Omit<MarketplaceItem, "id" | "seller">): Promise<string> => {
    if (!currentUser) {
      console.error("Cannot add marketplace item: User not authenticated.")
      throw new Error("User not authenticated.")
    }
    try {
      const newItemData = {
        ...item,
        seller: {
          id: currentUser.id,
          fullname: currentUser.fullname,
        },
        images: [], // Initialize empty images array for Firebase Storage
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, "marketplaceItems"), newItemData)
      console.log("Marketplace item added to Firestore.")
      return docRef.id
    } catch (error) {
      console.error("Error adding marketplace item:", error)
      throw error
    }
  }

  const updateRentalEquipmentImages = async (equipmentId: string, images: any[]): Promise<void> => {
    try {
      const equipmentRef = doc(db, "rentalEquipment", equipmentId)
      await updateDoc(equipmentRef, {
        images: images,
        mainImage: images.length > 0 ? images[0].url : null,
        mainImagePath: images.length > 0 ? images[0].path : null,
      })
      console.log("Rental equipment images updated in Firestore.")
    } catch (error) {
      console.error("Error updating rental equipment images:", error)
      throw error
    }
  }

  const updateMarketplaceItemImages = async (itemId: string, images: any[]): Promise<void> => {
    try {
      const itemRef = doc(db, "marketplaceItems", itemId)
      await updateDoc(itemRef, {
        images: images,
        mainImage: images.length > 0 ? images[0].url : null,
        mainImagePath: images.length > 0 ? images[0].path : null,
      })
      console.log("Marketplace item images updated in Firestore.")
    } catch (error) {
      console.error("Error updating marketplace item images:", error)
      throw error
    }
  }

  const createBooking = async (booking: Omit<Booking, "id" | "status" | "createdAt">): Promise<void> => {
    if (!currentUser) {
      console.error("Cannot create booking: User not authenticated.")
      throw new Error("User not authenticated.")
    }
    try {
      const newBookingData = {
        ...booking,
        startDate: Timestamp.fromDate(booking.startDate),
        endDate: Timestamp.fromDate(booking.endDate),
        totalPrice: booking.totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
        renterId: currentUser.id,
      }
      await addDoc(collection(db, "bookings"), newBookingData)
      console.log("Booking created in Firestore.")
    } catch (error) {
      console.error("Error creating booking:", error)
      throw error
    }
  }

  return (
    <DataContext.Provider
      value={{
        rentalEquipment,
        marketplaceItems,
        bookings,
        getRentalEquipmentById,
        getMarketplaceItemById,
        addRentalEquipment,
        addMarketplaceItem,
        updateRentalEquipmentImages,
        updateMarketplaceItemImages,
        createBooking,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
