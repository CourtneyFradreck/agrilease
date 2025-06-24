export interface EquipmentImage {
  url: string
  path: string
}

export interface RentalEquipment {
  id: string
  name: string
  type: string
  description: string
  rentalPrice: number
  location: string

  // Keep old field for backward compatibility
  image?: string

  // NEW: Firebase Storage fields
  mainImage?: string // Firebase Storage URL
  mainImagePath?: string // Firebase Storage path (for deletion)
  images?: EquipmentImage[] // Array of Firebase Storage images

  owner: {
    id: string
    fullname: string
  }
  rating: number
  reviewCount: number
  distance: number
}

export interface MarketplaceItem {
  id: string
  title: string
  type: string
  description: string
  condition: string
  year: number
  price: number
  location: string

  // Keep old field for backward compatibility
  image?: string

  // NEW: Firebase Storage fields
  mainImage?: string // Firebase Storage URL
  mainImagePath?: string // Firebase Storage path (for deletion)
  images?: EquipmentImage[] // Array of Firebase Storage images

  seller: {
    id: string
    fullname: string
  }
}

export interface Booking {
  id: string
  equipmentId: string
  startDate: Date
  endDate: Date
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
}
