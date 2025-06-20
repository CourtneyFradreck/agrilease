import React, { createContext, useContext, useState, useEffect } from 'react';
import { RentalEquipment, MarketplaceItem, Booking } from '@/types/equipment';
import { db } from '../FirebaseConfig'; // Adjust the path to your FirebaseConfig file
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  doc, 
  getDoc, 
  serverTimestamp, 
  Timestamp,
  where, // Import 'where' for filtering queries
  orderBy // Import 'orderBy' for sorting queries
} from 'firebase/firestore';

// Import useAuth from your AuthContext
import { useAuth } from './AuthContext'; 

interface DataContextType {
  rentalEquipment: RentalEquipment[];
  marketplaceItems: MarketplaceItem[];
  bookings: Booking[];
  getRentalEquipmentById: (id: string) => RentalEquipment | undefined;
  getMarketplaceItemById: (id: string) => MarketplaceItem | undefined;
  addRentalEquipment: (equipment: Omit<RentalEquipment, 'id' | 'owner' | 'rating' | 'reviewCount' | 'distance'>) => Promise<void>;
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'seller'>) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  rentalEquipment: [],
  marketplaceItems: [],
  bookings: [],
  getRentalEquipmentById: () => undefined,
  getMarketplaceItemById: () => undefined,
  addRentalEquipment: async () => {},
  addMarketplaceItem: async () => {},
  createBooking: async () => {},
});

export const useData = () => useContext(DataContext);

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [rentalEquipment, setRentalEquipment] = useState<RentalEquipment[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Use the currentUser from your AuthContext
  const { currentUser, loadingAuth } = useAuth(); // Also get loadingAuth to ensure auth state is ready

  // --- Fetch Rental Equipment from Firestore ---
  useEffect(() => {
    // Only fetch data if Firestore 'db' is initialized and auth loading is complete
    if (!db || loadingAuth) return; 

    // Query for all rental equipment, ordered by creation time
    const q = query(collection(db, 'rentalEquipment'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const equipmentList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          description: data.description,
          rentalPrice: typeof data.rentalPrice === 'number' ? data.rentalPrice : parseFloat(data.rentalPrice),
          location: data.location,
          image: data.image,
          owner: data.owner, // Stored as an object { id, fullname }
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          distance: data.distance || 0,
        } as RentalEquipment;
      });
      setRentalEquipment(equipmentList);
    }, (error) => {
      console.error("Error fetching rental equipment:", error);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db, loadingAuth]); // Depend on 'db' and 'loadingAuth'

  // --- Fetch Marketplace Items from Firestore ---
  useEffect(() => {
    if (!db || loadingAuth) return;

    // Query for all marketplace items, ordered by creation time
    const q = query(collection(db, 'marketplaceItems'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          type: data.type,
          description: data.description,
          condition: data.condition,
          year: data.year,
          price: typeof data.price === 'number' ? data.price : parseFloat(data.price),
          location: data.location,
          image: data.image,
          seller: data.seller, // Stored as an object { id, fullname }
        } as MarketplaceItem;
      });
      setMarketplaceItems(itemList);
    }, (error) => {
      console.error("Error fetching marketplace items:", error);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db, loadingAuth]);

  // --- Fetch Bookings from Firestore (filtered by current user) ---
  useEffect(() => {
    // Only fetch if Firestore 'db' is initialized, auth is loaded, and a user is logged in
    if (!db || loadingAuth || !currentUser?.id) {
        setBookings([]); // Clear bookings if no user is logged in
        return;
    }

    // Query for bookings where the renterId matches the current user's UID
    // Or where the equipment owner's ID matches the current user's UID (for owners viewing their equipment's bookings)
    // For simplicity, let's fetch bookings where the current user is the renter.
    // If you need to view bookings for equipment owned by the current user, you'd add another query or combine.
    const q = query(
      collection(db, 'bookings'),
      where('renterId', '==', currentUser.id), // Filter by current user's ID
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          equipmentId: data.equipmentId,
          startDate: (data.startDate as Timestamp)?.toDate() || new Date(), 
          endDate: (data.endDate as Timestamp)?.toDate() || new Date(),   
          totalPrice: data.totalPrice,
          status: data.status,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Booking;
      });
      setBookings(bookingList);
    }, (error) => {
      console.error("Error fetching bookings:", error);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db, loadingAuth, currentUser?.id]); // Depend on 'currentUser.id' for user-specific bookings


  const getRentalEquipmentById = (id: string): RentalEquipment | undefined => {
    return rentalEquipment.find(item => item.id === id);
  };

  const getMarketplaceItemById = (id: string): MarketplaceItem | undefined => {
    return marketplaceItems.find(item => item.id === id);
  };

  const addRentalEquipment = async (equipment: Omit<RentalEquipment, 'id' | 'owner' | 'rating' | 'reviewCount' | 'distance'>) => {
    if (!currentUser) {
      console.error('Cannot add rental equipment: User not authenticated.');
      throw new Error('User not authenticated.');
    }
    try {
      const newEquipmentData = {
        ...equipment,
        owner: {
          id: currentUser.id,
          fullname: currentUser.fullname, // Use fullname from AuthContext's User type
        },
        rating: 0,
        reviewCount: 0,
        distance: 0, // This will need to be calculated dynamically if needed
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'rentalEquipment'), newEquipmentData);
      console.log('Rental equipment added to Firestore.');
    } catch (error) {
      console.error('Error adding rental equipment:', error);
      throw error;
    }
  };

  const addMarketplaceItem = async (item: Omit<MarketplaceItem, 'id' | 'seller'>) => {
    if (!currentUser) {
      console.error('Cannot add marketplace item: User not authenticated.');
      throw new Error('User not authenticated.');
    }
    try {
      const newItemData = {
        ...item,
        seller: {
          id: currentUser.id,
          fullname: currentUser.fullname, // Use fullname from AuthContext's User type
        },
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'marketplaceItems'), newItemData);
      console.log('Marketplace item added to Firestore.');
    } catch (error) {
      console.error('Error adding marketplace item:', error);
      throw error;
    }
  };

  const createBooking = async (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    if (!currentUser) {
      console.error('Cannot create booking: User not authenticated.');
      throw new Error('User not authenticated.');
    }
    try {
      const newBookingData = {
        ...booking,
        startDate: Timestamp.fromDate(booking.startDate),
        endDate: Timestamp.fromDate(booking.endDate),
        totalPrice: booking.totalPrice, // Ensure totalPrice is passed in
        status: 'pending',
        createdAt: serverTimestamp(),
        renterId: currentUser.id, // Link booking to the current authenticated user
      };
      await addDoc(collection(db, 'bookings'), newBookingData);
      console.log('Booking created in Firestore.');
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

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
        createBooking,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}