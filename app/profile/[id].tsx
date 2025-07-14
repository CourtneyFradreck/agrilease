import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { db } from '@/FirebaseConfig';
import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { z } from 'zod';
import { UserSchema, EquipmentSchema, ListingSchema } from '@/utils/validators';
import {ListingCard} from '@/components/ListingCard'; // Assuming you have a ListingCard component

type UserProfile = z.infer<typeof UserSchema>;
type EquipmentListing = z.infer<typeof ListingSchema> & {
  equipment: z.infer<typeof EquipmentSchema>;
};

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const ERROR_RED = '#DC2626';

export default function OwnerProfile() {
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<EquipmentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const defaultOwnerImage = 'https://www.gravatar.com/avatar/?d=mp';

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('User ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch user data
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          setError('User not found.');
          setLoading(false);
          return;
        }
        const userData = UserSchema.parse({ ...userSnap.data(), id: userSnap.id });
        setUser(userData);

        // Fetch user's listings
        const listingsQuery = query(
          collection(db, 'listings'),
          where('ownerId', '==', userId),
        );
        const listingsSnapshot = await getDocs(listingsQuery);
        const userListings: EquipmentListing[] = [];

        for (const listingDoc of listingsSnapshot.docs) {
          const listingData = ListingSchema.parse({
            ...listingDoc.data(),
            id: listingDoc.id,
          });
          const equipmentDocRef = doc(
            db,
            'equipment',
            listingData.equipmentId,
          );
          const equipmentSnap = await getDoc(equipmentDocRef);
          if (equipmentSnap.exists()) {
            const equipmentData = EquipmentSchema.parse({
              ...equipmentSnap.data(),
              id: equipmentSnap.id,
            });
            userListings.push({ ...listingData, equipment: equipmentData });
          }
        }
        setListings(userListings);
      } catch (e) {
        console.error('Error fetching user profile: ', e);
        if (e instanceof z.ZodError) {
          setError(
            `Data validation error: ${e.errors
              .map((err) => err.message)
              .join(', ')}`,
          );
        } else {
          setError('Failed to load user profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleStartConversation = () => {
    if (!userId) return;
    router.push(`/messages/${userId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'User not found.'}</Text>
        <Button
          onPress={() => router.back()}
          text="Go Back"
          style={styles.goBackButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={HEADER_TEXT_COLOR}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Owner Profile</Text>
        <View style={{ width: 24 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user.profileImageUrl || defaultOwnerImage }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              {user.averageRating
                ? `⭐ ${user.averageRating.toFixed(1)} (${
                    user.numberOfRatings
                  } reviews)`
                : 'No ratings yet'}
            </Text>
        </View>
          {user.location && (
            <Text style={styles.locationText}>
              📍
              {user.location
                ? [
                    user.location.address,
                    user.location.region,
                    user.location.country,
                  ] 
                    .filter(Boolean)
                    .join(', ')
                    : 'Not set'}
            </Text>
          )}
        </View>

        {currentUserId !== userId && (
          <View style={styles.actionButtonContainer}>
            <Button
              onPress={handleStartConversation}
              text="Message Owner"
              style={styles.messageButton}
              textStyle={styles.messageButtonText}
            />
          </View>
        )}

        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>
            Equipment Listed by {user.name}
          </Text>
          {listings.length > 0 ? (
            <FlatList
              data={listings}
              renderItem={({ item }) => (
                <ListingCard
                  listing={item}
                  onPress={() => router.push(`/listings/${item.id}`)}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listingsGrid}
              numColumns={2}
            />
          ) : (
            <Text style={styles.noListingsText}>
              This user has no equipment listed at the moment.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: TEXT_SECONDARY_GREY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: ERROR_RED,
    marginBottom: 16,
    textAlign: 'center',
  },
  goBackButton: {
    width: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: MAIN_COLOR,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HEADER_TEXT_COLOR,
  },
  backButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_DARK,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
  },
  locationText: {
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    marginTop: 8,
  },
  actionButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  messageButton: {
    backgroundColor: MAIN_COLOR,
    borderRadius: BORDER_RADIUS,
  },
  messageButtonText: {
    color: HEADER_TEXT_COLOR,
    fontWeight: 'bold',
  },
  listingsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY_DARK,
    marginBottom: 16,
  },
  listingsGrid: {
    justifyContent: 'space-between',
  },
  noListingsText: {
    textAlign: 'center',
    color: TEXT_SECONDARY_GREY,
    marginTop: 20,
  },
});
