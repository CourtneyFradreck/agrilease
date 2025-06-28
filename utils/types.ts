export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: 'farmer' | 'equipmentOwner' | 'both';
  profileImageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    region?: string;
    country: string;
  };
  registrationDate: number;
  bio?: string;
  averageRating: number;
  numberOfRatings: number;
}

export interface Equipment {
  id?: string;
  ownerId: string;
  name: string;
  type: string;
  description: string;
  make: string;
  model: string;
  yearOfManufacture?: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
  images: string[];
  currentLocation: GeoPoint;
  lastUpdatedAt: number;
}

export interface Listing {
  id?: string;
  equipmentId: string;
  ownerId: string;
  listingType: 'rent' | 'sell';
  status: 'active' | 'pending_transaction' | 'completed' | 'cancelled';
  price: number;
  rentalUnit?: 'hour' | 'day' | 'week' | 'month';
  availabilityStartDate?: number;
  availabilityEndDate?: number;
  createdAt: number;
  listingLocation: GeoPoint;
  negotiable: boolean;
  views: number;
}

export interface Transaction {
  id?: string;
  listingId: string;
  equipmentId: string;
  customerId: string;
  transactionType: 'rental' | 'sale';
  status:
    | 'requested'
    | 'accepted'
    | 'rejected'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'disputed';
  agreedPrice: number;
  startDate?: number;
  endDate?: number;
  transactionDate: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_paid';
  ownerReviewId?: string;
  customerReviewId?: string;
}

export interface Review {
  id?: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: number;
}
