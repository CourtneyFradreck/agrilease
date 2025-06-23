import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';

// Import Firebase services
import { auth, db } from '../FirebaseConfig'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile as firebaseUpdateProfile // Renamed to avoid conflict
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  loadingAuth: boolean; 
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullname: string, email: string, phone: string, password: string, userType: 'farmer' | 'owner') => Promise<boolean>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  loadingAuth: true, 
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateProfile: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in. Fetch their additional data from Firestore.
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userDataFromFirestore = userDocSnap.data() as Omit<User, 'id'>;
            const fullUser: User = {
              id: user.uid,
              ...userDataFromFirestore,
              // Prioritize Firebase Auth email if Firestore doc somehow misses it, though it should be consistent
              email: user.email || userDataFromFirestore.email, 
              fullname: user.displayName || userDataFromFirestore.fullname, // Use displayName from Firebase Auth if available
            };
            setCurrentUser(fullUser);
            setIsAuthenticated(true);
            await AsyncStorage.setItem('@user', JSON.stringify(fullUser));
          } else {
            console.warn('User document not found in Firestore for UID:', user.uid);
            // This is crucial: if the Firestore document doesn't exist, it means the registration
            // process likely failed to complete its Firestore part.
            // We should NOT sign them out immediately here unless we want to force re-registration.
            // Instead, we might leave isAuthenticated as false, or show a specific UI.
            // For now, let's just clear the current user and ensure they're not authenticated based on incomplete data.
            // A common pattern is to redirect to a "complete profile" screen.
            setCurrentUser(null); 
            setIsAuthenticated(false);
            await AsyncStorage.removeItem('@user');
            // If you want to ensure the user is signed out from Auth if their Firestore data is missing:
            // await signOut(auth); 
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
          setCurrentUser(null);
          setIsAuthenticated(false);
          await AsyncStorage.removeItem('@user');
        }
      } else {
        // User is signed out.
        setCurrentUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('@user');
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoadingAuth(true); // Indicate loading for login
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged listener will handle setting currentUser and isAuthenticated
      return true; 
    } catch (error: any) {
      console.error('Firebase Login Error:', error.code, error.message);
      setLoadingAuth(false); // Reset loading on error
      return false;
    }
  };

  const register = async (
    fullname: string, 
    email: string, 
    phone: string, 
    password: string, 
    userType: 'farmer' | 'owner'
  ): Promise<boolean> => {
    try {
      setLoadingAuth(true); // Start loading immediately for registration
      
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Set user's display name in Firebase Auth profile (optional but good practice)
      // This is crucial for onAuthStateChanged to pick up the fullname
      await firebaseUpdateProfile(user, { displayName: fullname });

      // 3. Prepare additional user data for Firestore
      const newUserDocData: User = { // Use User type for consistency
        id: user.uid,
        fullname: fullname, // Ensure fullname is explicitly set here
        email: email,       // Ensure email is explicitly set here
        phone: phone,
        userType: userType,
        location: 'Not set', // Default or prompt later
        createdAt: new Date().toISOString(), // Use ISO string for consistency
        rentals: [], 
        listings: [],
      };

      // 4. Save additional user data to Firestore
      // Use the actual UID from Firebase Auth as the document ID
      await setDoc(doc(db, 'users', user.uid), newUserDocData);

      // IMPORTANT: After setDoc, the onAuthStateChanged listener will fire.
      // Because we waited for setDoc to complete, when onAuthStateChanged fires,
      // the user document in Firestore should now exist.
      console.log("User registered successfully and Firestore document created.");
      return true;
    } catch (error: any) {
      console.error('Firebase Register Error:', error.code, error.message);
      // It's good practice to reflect the loading state change on failure too
      setLoadingAuth(false); 
      return false;
    }
  };

  const logout = async () => {
    try {
      setLoadingAuth(true); // Indicate loading for logout
      await signOut(auth);
      // onAuthStateChanged listener will handle clearing currentUser and isAuthenticated
    } catch (error) {
      console.error('Firebase Logout Error:', error);
      setLoadingAuth(false); // Reset loading on error
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser || !auth.currentUser) {
      console.error("No current user to update.");
      return false;
    }

    try {
      setLoadingAuth(true); // Indicate loading for profile update
      const userDocRef = doc(db, 'users', currentUser.id);
      
      // Update Firestore document with new data
      await updateDoc(userDocRef, userData);

      // If name needs to be updated directly in Auth displayName
      if (userData.fullname && auth.currentUser.displayName !== userData.fullname) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: userData.fullname });
      }
      
      // Manually update the local currentUser state to reflect changes immediately
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser)); // Persist updated user
      console.log("User profile updated successfully.");
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    } finally {
      setLoadingAuth(false); // Ensure loading is reset
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser, 
      loadingAuth, 
      login, 
      register, 
      logout,
      updateProfile
    }}>
      {/* Conditionally render children. This prevents UI flashes while checking auth. */}
      {!loadingAuth ? children : null} 
    </AuthContext.Provider>
  );
}