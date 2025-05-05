export interface RentalEquipment {
  id: string;
  name: string;
  type: string;
  description: string;
  rentalPrice: number;
  location: string;
  image: string;
  owner: {
    id: string;
    name: string;
  };
  rating?: number;
  reviewCount?: number;
  distance?: number;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  type: string;
  description: string;
  condition: string;
  year: number;
  price: number;
  location: string;
  image: string;
  seller: {
    id: string;
    name: string;
  };
}

export interface Booking {
  id: string;
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}