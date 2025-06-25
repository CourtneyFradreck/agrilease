import { z } from 'zod';

export const GeoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name cannot be empty.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number cannot be empty.')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.'),
  userType: z.enum(['farmer', 'equipmentOwner', 'both']),
  profileImageUrl: z.string().optional().default(''),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    region: z.string().optional(),
    country: z.string().min(1, 'Country cannot be empty.'),
  }),
  registrationDate: z
    .number()
    .int()
    .positive('Registration date must be a positive integer timestamp.'),
  bio: z.string().optional().default(''),
  averageRating: z
    .number()
    .min(0, 'Rating must be at least 0.')
    .max(5, 'Rating cannot exceed 5.')
    .default(0)
    .optional(),
  numberOfRatings: z
    .number()
    .int()
    .min(0, 'Number of ratings cannot be negative.')
    .default(0),
});

export const EquipmentSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().min(1, 'Owner ID cannot be empty.'),
  name: z.string().min(1, 'Equipment name cannot be empty.'),
  type: z.string().min(1, 'Equipment type cannot be empty.'),
  description: z.string().min(1, 'Description cannot be empty.'),
  make: z.string().min(1, 'Make cannot be empty.'),
  model: z.string().min(1, 'Model cannot be empty.'),
  yearOfManufacture: z
    .number()
    .int()
    .min(1900, 'Year of manufacture too early.')
    .max(new Date().getFullYear() + 5, 'Year of manufacture too far in future.')
    .optional(),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Needs Repair']),
  images: z
    .array(z.string().url('Invalid image URL.'))
    .min(0, 'At least one image URL is recommended.'),
  currentLocation: GeoPointSchema,
  lastUpdatedAt: z
    .number()
    .int()
    .positive('Last updated timestamp must be a positive integer.'),
});

export const ListingSchema = z.object({
  id: z.string().optional(),
  equipmentId: z.string().min(1, 'Equipment ID cannot be empty.'),
  ownerId: z.string().min(1, 'Owner ID cannot be empty.'),
  listingType: z.enum(['rent', 'sell']),
  status: z.enum(['active', 'pending_transaction', 'completed', 'cancelled']),
  price: z.number().positive('Price must be a positive number.').min(0),
  rentalUnit: z.enum(['hour', 'day', 'week', 'month']).optional(),
  availabilityStartDate: z
    .number()
    .int()
    .positive('Start date must be a positive integer timestamp.')
    .optional(),
  availabilityEndDate: z
    .number()
    .int()
    .positive('End date must be a positive integer timestamp.')
    .optional(),
  createdAt: z
    .number()
    .int()
    .positive('Creation timestamp must be a positive integer.'),
  listingLocation: GeoPointSchema,
  negotiable: z.boolean(),
  views: z.number().int().min(0, 'Views cannot be negative.').default(0),
});

export const TransactionSchema = z.object({
  id: z.string().optional(),
  listingId: z.string().min(1, 'Listing ID cannot be empty.'),
  equipmentId: z.string().min(1, 'Equipment ID cannot be empty.'),
  customerId: z.string().min(1, 'Customer ID cannot be empty.'),
  transactionType: z.enum(['rental', 'sale']),
  status: z.enum([
    'requested',
    'accepted',
    'rejected',
    'in_progress',
    'completed',
    'cancelled',
    'disputed',
  ]),
  agreedPrice: z.number().positive('Agreed price must be a positive number.'),
  startDate: z
    .number()
    .int()
    .positive('Start date must be a positive integer timestamp.')
    .optional(),
  endDate: z
    .number()
    .int()
    .positive('End date must be a positive integer timestamp.')
    .optional(),
  transactionDate: z
    .number()
    .int()
    .positive('Transaction date must be a positive integer timestamp.'),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'partially_paid']),
  ownerReviewId: z.string().optional(),
  customerReviewId: z.string().optional(),
});

export const ReviewSchema = z.object({
  id: z.string().optional(),
  transactionId: z.string().min(1, 'Transaction ID cannot be empty.'),
  reviewerId: z.string().min(1, 'Reviewer ID cannot be empty.'),
  revieweeId: z.string().min(1, 'Reviewee ID cannot be empty.'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be an integer between 1 and 5.')
    .max(5),
  comment: z.string().optional(),
  createdAt: z
    .number()
    .int()
    .positive('Creation timestamp must be a positive integer.'),
});

export const BookingSchema = z
  .object({
    id: z.string().optional(),
    equipmentId: z.string().min(1, 'Equipment ID is required.'),
    listingId: z.string().min(1, 'Listing ID is required.'),
    renterId: z.string().min(1, 'Renter ID is required.'),
    ownerId: z.string().min(1, 'Owner ID is required.'),
    startDate: z
      .number()
      .int()
      .positive('Start date must be a valid timestamp.'), // Timestamp in milliseconds
    endDate: z.number().int().positive('End date must be a valid timestamp.'), // Timestamp in milliseconds
    totalPrice: z.number().positive('Total price must be a positive number.'),
    bookingDate: z
      .number()
      .int()
      .positive('Booking date must be a valid timestamp.')
      .default(() => Date.now()), // Timestamp
    status: z
      .enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled'])
      .default('pending'),
  })
  .superRefine((data, ctx) => {
    if (data.startDate >= data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date.',
        path: ['endDate'],
      });
    }
  });
