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
  updateProfile as firebaseUpdateProfile
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
  const [isRegistering, setIsRegistering] = useState(false); // Track registration state

  // Listen for Firebase Auth state changes with improved handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If we're in the middle of registration, skip this auth state change
      // to prevent race conditions
      if (isRegistering) {
        return;
      }

      if (user) {
        // User is signed in. Fetch their additional data from Firestore.
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userDataFromFirestore = userDocSnap.data() as Omit<User, 'id'>;
            const fullUser: User = {
              id: user.uid,
              email: user.email || userDataFromFirestore.email,
              fullname: user.displayName || userDataFromFirestore.fullname,
              ...userDataFromFirestore,
            };
            
            setCurrentUser(fullUser);
            setIsAuthenticated(true);
            await AsyncStorage.setItem('@user', JSON.stringify(fullUser));
          } else {
            // Document doesn't exist - could be during registration or incomplete setup
            console.warn('User document not found in Firestore for UID:', user.uid);
            
            // Wait a bit and retry once (for race condition during registration)
            setTimeout(async () => {
              try {
                const retryDocSnap = await getDoc(userDocRef);
                if (retryDocSnap.exists()) {
                  const userDataFromFirestore = retryDocSnap.data() as Omit<User, 'id'>;
                  const fullUser: User = {
                    id: user.uid,
                    email: user.email || userDataFromFirestore.email,
                    fullname: user.displayName || userDataFromFirestore.fullname,
                    ...userDataFromFirestore,
                  };
                  
                  setCurrentUser(fullUser);
                  setIsAuthenticated(true);
                  await AsyncStorage.setItem('@user', JSON.stringify(fullUser));
                } else {
                  // Still no document - sign out user
                  console.error('User document still not found after retry');
                  await signOut(auth);
                }
              } catch (error) {
                console.error('Error during retry fetch:', error);
                await signOut(auth);
              }
            }, 1000); // Wait 1 second before retry
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
  }, [isRegistering]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoadingAuth(true);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged listener will handle setting currentUser and isAuthenticated
      return true; 
    } catch (error: any) {
      console.error('Firebase Login Error:', error.code, error.message);
      setLoadingAuth(false);
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
      setLoadingAuth(true);
      setIsRegistering(true); // Prevent auth state listener from interfering
      
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Prepare user data for Firestore
      const newUserDocData: User = {
        id: user.uid,
        fullname: fullname, 
        email: email,       
        phone: phone,
        userType: userType,
        location: 'Not set',
        createdAt: new Date().toISOString(),
        rentals: [], 
        listings: [],
      };

      // 3. Create Firestore document BEFORE updating profile
      await setDoc(doc(db, 'users', user.uid), newUserDocData);
      
      // 4. Update Firebase Auth profile
      await firebaseUpdateProfile(user, { displayName: fullname });

      // 5. Manually set the user state to prevent race conditions
      setCurrentUser(newUserDocData);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('@user', JSON.stringify(newUserDocData));
      
      console.log("User registered successfully and Firestore document created.");
      
      return true;
    } catch (error: any) {
      console.error('Firebase Register Error:', error.code, error.message);
      
      // If there's an error, make sure to clean up any partial registration
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteError) {
          console.error('Error cleaning up failed registration:', deleteError);
        }
      }
      
      return false;
    } finally {
      setIsRegistering(false); // Allow auth state listener to work again
      setLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      setLoadingAuth(true);
      await signOut(auth);
      // onAuthStateChanged listener will handle clearing currentUser and isAuthenticated
    } catch (error) {
      console.error('Firebase Logout Error:', error);
      setLoadingAuth(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser || !auth.currentUser) {
      console.error("No current user to update.");
      return false;
    }

    try {
      setLoadingAuth(true);
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
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      console.log("User profile updated successfully.");
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    } finally {
      setLoadingAuth(false);
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
      {children}
    </AuthContext.Provider>
  );
}