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
  loadingAuth: boolean; // Add a loading state for initial auth check
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullname: string, email: string, phone: string, password: string, userType: 'farmer' | 'owner') => Promise<boolean>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  loadingAuth: true, // Default to true
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
  const [loadingAuth, setLoadingAuth] = useState(true); // New loading state

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
              email: user.email || userDataFromFirestore.email, // Use Firebase email as primary if available
              fullname: user.displayName || userDataFromFirestore.fullname,
            };
            setCurrentUser(fullUser);
            setIsAuthenticated(true);
            await AsyncStorage.setItem('@user', JSON.stringify(fullUser)); // Persist to AsyncStorage
          } else {
            console.warn('User document not found in Firestore for UID:', user.uid);
            // This case might happen if a user signs up but their Firestore doc fails to create.
            // You might want to handle it (e.g., sign them out or create a minimal doc).
            // For now, we'll sign them out.
            await signOut(auth);
            setCurrentUser(null);
            setIsAuthenticated(false);
            await AsyncStorage.removeItem('@user');
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
      setLoadingAuth(false); // Auth check complete
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged listener will handle setting currentUser and isAuthenticated
      // We don't need to manually set it here, just confirm success
      return true; 
    } catch (error: any) {
      console.error('Firebase Login Error:', error.code, error.message);
      // You can refine error messages based on error.code
      // For example:
      // if (error.code === 'auth/invalid-credential') setError('Invalid email or password');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Now, store additional user data in Firestore
      const newUser: User = {
        id: user.uid,
        fullname,
        email, // Email from Firebase Auth
        phone,
        userType,
        location: 'Set your location', // Default or prompt later
        createdAt: new Date().toISOString(),
        rentals: [], // Initialize empty arrays
        listings: [],
      };

      // Set user's display name in Firebase Auth profile (optional but good practice)
      await firebaseUpdateProfile(user, { displayName: fullname });

      // Save user data to Firestore in a 'users' collection with UID as document ID
      await setDoc(doc(db, 'users', user.uid), newUser);

      // onAuthStateChanged listener will pick up the new user and set state
      return true;
    } catch (error: any) {
      console.error('Firebase Register Error:', error.code, error.message);
      // Example of handling common Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        // You might want to return a specific error message to the UI
        console.error('Email already in use!');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged listener will handle clearing currentUser and isAuthenticated
    } catch (error) {
      console.error('Firebase Logout Error:', error);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser || !auth.currentUser) {
      console.error("No current user to update.");
      return false;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.id);
      
      // Update Firestore document with new data
      await updateDoc(userDocRef, userData);

      // If name or email (if it changes in Firebase Auth) needs to be updated directly in Auth
      if (userData.fullname && auth.currentUser.displayName !== userData.fullname) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: userData.fullname });
      }
      // Note: Changing email in Firebase Auth requires re-authentication for security.
      // For simplicity, we are not handling email update in Auth here, only in Firestore document.

      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser, 
      loadingAuth, // Expose loading state
      login, 
      register, 
      logout,
      updateProfile
    }}>
      {/* Only render children when authentication check is complete */}
      {!loadingAuth ? children : null} 
    </AuthContext.Provider>
  );
}