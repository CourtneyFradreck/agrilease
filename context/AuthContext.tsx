import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { UserSchema } from '@/utils/validators';
import {
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '../FirebaseConfig';

type UserDataFromFirestore = z.infer<typeof UserSchema>;

export type User = UserDataFromFirestore & { id: string };

type RegisterInput = Omit<
  UserDataFromFirestore,
  'id' | 'registrationDate' | 'averageRating' | 'numberOfRatings'
>;

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  loadingAuth: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterInput, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
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
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isRegistering) {
        return;
      }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          console.log(firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userDataFromFirestore = UserSchema.parse(userDocSnap.data());
            const fullUser: User = {
              id: firebaseUser.uid,
              ...userDataFromFirestore,
            };

            setCurrentUser(fullUser);
            setIsAuthenticated(true);
            await AsyncStorage.setItem('@user', JSON.stringify(fullUser));
          } else {
            console.warn(
              'User document not found in Firestore for UID:',
              firebaseUser.uid,
            );
            setTimeout(async () => {
              try {
                const retryDocSnap = await getDoc(userDocRef);
                if (retryDocSnap.exists()) {
                  const userDataFromFirestore = UserSchema.parse(
                    retryDocSnap.data(),
                  );
                  const fullUser: User = {
                    id: firebaseUser.uid,
                    ...userDataFromFirestore,
                  };
                  setCurrentUser(fullUser);
                  setIsAuthenticated(true);
                  await AsyncStorage.setItem('@user', JSON.stringify(fullUser));
                } else {
                  console.error(
                    'User document still not found after retry, signing out.',
                  );
                  await signOut(auth);
                }
              } catch (error) {
                console.error('Error during retry fetch or parsing:', error);
                await signOut(auth);
              }
            }, 1000);
          }
        } catch (error) {
          console.error(
            'Error fetching user data from Firestore or parsing:',
            error,
          );
          setCurrentUser(null);
          setIsAuthenticated(false);
          await AsyncStorage.removeItem('@user');
          await signOut(auth);
        }
      } else {
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
      return true;
    } catch (error: any) {
      console.error('Firebase Login Error:', error.code, error.message);
      setLoadingAuth(false);
      return false;
    }
  };

  const register = async (
    userData: RegisterInput,
    password: string,
  ): Promise<boolean> => {
    try {
      setLoadingAuth(true);
      setIsRegistering(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        password,
      );
      const firebaseUser = userCredential.user;

      const newUserDocData: UserDataFromFirestore = {
        ...userData,
        registrationDate: Date.now(),
        averageRating: 0,
        numberOfRatings: 0,
      };

      const validatedData = UserSchema.parse(newUserDocData);

      await setDoc(doc(db, 'users', firebaseUser.uid), validatedData);

      await firebaseUpdateProfile(firebaseUser, { displayName: userData.name });

      setCurrentUser({ id: firebaseUser.uid, ...validatedData });
      setIsAuthenticated(true);
      await AsyncStorage.setItem(
        '@user',
        JSON.stringify({ id: firebaseUser.uid, ...validatedData }),
      );

      console.log(
        'User registered successfully and Firestore document created.',
      );
      return true;
    } catch (error: any) {
      console.error('Firebase Register Error:', error.code, error.message);

      if (auth.currentUser && error.code !== 'auth/email-already-in-use') {
        try {
          await auth.currentUser.delete();
        } catch (deleteError) {
          console.error('Error cleaning up failed registration:', deleteError);
        }
      }
      return false;
    } finally {
      setIsRegistering(false);
      setLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      setLoadingAuth(true);
      await signOut(auth);
    } catch (error) {
      console.error('Firebase Logout Error:', error);
      setLoadingAuth(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser || !auth.currentUser) {
      console.error('No current user to update.');
      return false;
    }

    try {
      setLoadingAuth(true);
      const userDocRef = doc(db, 'users', currentUser.id);

      const validatedUpdates = UserSchema.partial().parse(updates);

      await updateDoc(userDocRef, validatedUpdates);

      if (
        validatedUpdates.name &&
        auth.currentUser.displayName !== validatedUpdates.name
      ) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: validatedUpdates.name,
        });
      }

      const updatedUser = { ...currentUser, ...validatedUpdates };
      setCurrentUser(updatedUser);
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      console.log('User profile updated successfully.');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        loadingAuth,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
