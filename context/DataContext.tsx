import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RentalEquipment, MarketplaceItem, Booking } from '@/types/equipment';

interface DataContextType {
  rentalEquipment: RentalEquipment[];
  marketplaceItems: MarketplaceItem[];
  bookings: Booking[];
  getRentalEquipmentById: (id: string) => RentalEquipment | undefined;
  getMarketplaceItemById: (id: string) => MarketplaceItem | undefined;
  addRentalEquipment: (equipment: Omit<RentalEquipment, 'id'>) => void;
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id'>) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType>({
  rentalEquipment: [],
  marketplaceItems: [],
  bookings: [],
  getRentalEquipmentById: () => undefined,
  getMarketplaceItemById: () => undefined,
  addRentalEquipment: () => {},
  addMarketplaceItem: () => {},
  createBooking: () => {},
});

export const useData = () => useContext(DataContext);

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [rentalEquipment, setRentalEquipment] = useState<RentalEquipment[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Initialize with mock data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if we already have data in AsyncStorage
        const storedRentals = await AsyncStorage.getItem('@rentalEquipment');
        const storedMarketplace = await AsyncStorage.getItem('@marketplaceItems');
        const storedBookings = await AsyncStorage.getItem('@bookings');
        
        if (!storedRentals) {
          // If no data, initialize with mock data
          await AsyncStorage.setItem('@rentalEquipment', JSON.stringify(mockRentalEquipment));
          setRentalEquipment(mockRentalEquipment);
        } else {
          setRentalEquipment(JSON.parse(storedRentals));
        }
        
        if (!storedMarketplace) {
          await AsyncStorage.setItem('@marketplaceItems', JSON.stringify(mockMarketplaceItems));
          setMarketplaceItems(mockMarketplaceItems);
        } else {
          setMarketplaceItems(JSON.parse(storedMarketplace));
        }
        
        if (!storedBookings) {
          await AsyncStorage.setItem('@bookings', JSON.stringify([]));
          setBookings([]);
        } else {
          setBookings(JSON.parse(storedBookings));
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        // Fall back to mock data if AsyncStorage fails
        setRentalEquipment(mockRentalEquipment);
        setMarketplaceItems(mockMarketplaceItems);
        setBookings([]);
      }
    };
    
    initializeData();
  }, []);
  
  const getRentalEquipmentById = (id: string): RentalEquipment | undefined => {
    return rentalEquipment.find(item => item.id === id);
  };
  
  const getMarketplaceItemById = (id: string): MarketplaceItem | undefined => {
    return marketplaceItems.find(item => item.id === id);
  };
  
  const addRentalEquipment = async (equipment: Omit<RentalEquipment, 'id'>) => {
    const newEquipment: RentalEquipment = {
      ...equipment,
      id: `rental-${Date.now()}`,
      owner: {
        id: '2',
        name: 'Jane Smith',
      },
      rating: 4.8,
      reviewCount: 5,
      distance: Math.floor(Math.random() * 20) + 1, // Random distance 1-20 km
    };
    
    const updatedEquipment = [...rentalEquipment, newEquipment];
    setRentalEquipment(updatedEquipment);
    
    try {
      await AsyncStorage.setItem('@rentalEquipment', JSON.stringify(updatedEquipment));
    } catch (error) {
      console.error('Error saving rental equipment:', error);
    }
  };
  
  const addMarketplaceItem = async (item: Omit<MarketplaceItem, 'id'>) => {
    const newItem: MarketplaceItem = {
      ...item,
      id: `market-${Date.now()}`,
      seller: {
        id: '2',
        name: 'Jane Smith',
      },
    };
    
    const updatedItems = [...marketplaceItems, newItem];
    setMarketplaceItems(updatedItems);
    
    try {
      await AsyncStorage.setItem('@marketplaceItems', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error saving marketplace item:', error);
    }
  };
  
  const createBooking = async (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    
    try {
      await AsyncStorage.setItem('@bookings', JSON.stringify(updatedBookings));
    } catch (error) {
      console.error('Error saving booking:', error);
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

// Mock Data
const mockRentalEquipment: RentalEquipment[] = [
  {
    id: '1',
    name: 'John Deere 5075E Utility Tractor',
    type: 'Tractors',
    description: 'A reliable utility tractor perfect for small to medium farms. Features 75HP engine, 4WD, and comfortable operator station.',
    rentalPrice: 150,
    location: 'Springfield, IL',
    image: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
    owner: {
      id: '2',
      name: 'Jane Smith',
    },
    rating: 4.8,
    reviewCount: 12,
    distance: 5,
  },
  {
    id: '2',
    name: 'Case IH 2388 Combine Harvester',
    type: 'Harvesters',
    description: 'Efficient combine harvester with excellent grain handling capabilities. Perfect for wheat, corn, and soybean harvesting.',
    rentalPrice: 350,
    location: 'Greenfield, OR',
    image: 'https://images.pexels.com/photos/6253181/pexels-photo-6253181.jpeg',
    owner: {
      id: '3',
      name: 'Robert Johnson',
    },
    rating: 4.6,
    reviewCount: 8,
    distance: 12,
  },
  {
    id: '3',
    name: 'Kuhn 7-Disc Mower',
    type: 'Tillage',
    description: 'Professional-grade disc mower with 7 blades, ideal for hay cutting and field maintenance. Easy to operate and maintain.',
    rentalPrice: 95,
    location: 'Greenfield, OR',
    image: 'https://images.pexels.com/photos/12398793/pexels-photo-12398793.jpeg',
    owner: {
      id: '2',
      name: 'Jane Smith',
    },
    rating: 4.9,
    reviewCount: 15,
    distance: 3,
  },
  {
    id: '4',
    name: 'Valley 8000 Series Irrigation System',
    type: 'Irrigation',
    description: 'Advanced center pivot irrigation system with GPS guidance. Covers up to 30 acres with efficient water distribution.',
    rentalPrice: 200,
    location: 'Springfield, IL',
    image: 'https://images.pexels.com/photos/1483880/pexels-photo-1483880.jpeg',
    owner: {
      id: '4',
      name: 'Maria Garcia',
    },
    rating: 4.7,
    reviewCount: 6,
    distance: 18,
  },
];

const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Used John Deere 6155M Tractor',
    type: 'Tractor',
    description: 'Well-maintained 2018 John Deere 6155M with 1200 hours. Includes cab, air conditioning, and PTO. Perfect working condition.',
    condition: 'Excellent',
    year: 2018,
    price: 85000,
    location: 'Springfield, IL',
    image: 'https://images.pexels.com/photos/2556713/pexels-photo-2556713.jpeg',
    seller: {
      id: '2',
      name: 'Jane Smith',
    },
  },
  {
    id: '2',
    title: 'New Holland L220 Skid Steer',
    type: 'Loader',
    description: '2016 New Holland L220 with 2500 hours. Includes bucket attachment, forks, and maintenance records. New tires installed last year.',
    condition: 'Good',
    year: 2016,
    price: 32000,
    location: 'Greenfield, OR',
    image: 'https://images.pexels.com/photos/96938/pexels-photo-96938.jpeg',
    seller: {
      id: '3',
      name: 'Robert Johnson',
    },
  },
  {
    id: '3',
    title: 'Case IH Farmall 75A',
    type: 'Tractor',
    description: 'Low-hour 2019 Case IH Farmall 75A with loader. Perfect for small farm operations. 4WD, 540 PTO. Excellent fuel economy.',
    condition: 'Like New',
    year: 2019,
    price: 45000,
    location: 'Springfield, IL',
    image: 'https://images.pexels.com/photos/4439566/pexels-photo-4439566.jpeg',
    seller: {
      id: '4',
      name: 'Maria Garcia',
    },
  },
];