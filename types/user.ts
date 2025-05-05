export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'farmer' | 'owner';
  location: string;
  createdAt: string;
  rentals?: string[]; // IDs of rented equipment
  listings?: string[]; // IDs of equipment listed by user
}