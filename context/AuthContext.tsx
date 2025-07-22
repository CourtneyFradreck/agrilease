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
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '../FirebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterInput,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  loadingAuth: true,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  register: async () => ({ success: false, error: 'Auth not initialized' }),
  logout: () => {},
  updateProfile: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

const getFirebaseErrorMessage = (error: any): string => {
  if (error.message === 'Operation timed out') {
    return 'The operation took too long. Please check your internet connection and try again.';
  }
  switch (error.code) {
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please use a different email or log in.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/too-many-requests':
      return 'Too many login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export async function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const functions = getFunctions();
  const registerPushTokenCloudFunction = httpsCallable(functions, 'registerPushToken');

  const handlePushTokenRegistration = async (userId: string) => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await registerPushTokenCloudFunction({ token });
        console.log('Expo Push Token registered via Cloud Function.');
      }
    } catch (error) {
      console.error('Error registering push token via Cloud Function:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isRegistering) {
        console.log(
          'Auth State Changed: Registration is in progress, deferring full state update.',
        );
        setLoadingAuth(false);
        return;
      }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            console.log('User document found.');
            const userDataFromFirestore = UserSchema.parse(userDocSnap.data());
            const fullUser: User = {
              id: firebaseUser.uid,
              ...userDataFromFirestore,
            };

            setCurrentUser(fullUser);
            setIsAuthenticated(true);
            await AsyncStorage.setItem('@user', JSON.stringify(fullUser));
            console.log(
              'Auth State Changed: User successfully loaded and set.',
            );
            // Register push token after successful login/auth state change
            await handlePushTokenRegistration(firebaseUser.uid);
          } else {
            console.warn(
              'Auth State Changed: Firebase user found, but no Firestore document. Signing out.',
            );
            await signOut(auth);
          }
        } catch (error: any) {
          console.error(
            'Auth State Changed Error: Failed to load user from Firestore or operation timed out:',
            error.message,
          );
          setCurrentUser(null);
          setIsAuthenticated(false);
          await AsyncStorage.removeItem('@user');
          await signOut(auth);
        }
      } else {
        console.log(
          'Auth State Changed: No Firebase user found. User is logged out.',
        );
        setCurrentUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('@user');
      }

      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [isRegistering]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setLoadingAuth(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log('Login Success:', userCredential.user.email);
      // Register push token after successful login
      await handlePushTokenRegistration(userCredential.user.uid);
      return { success: true };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      console.error('Login Error:', error.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingAuth(false);
    }
  };

  const register = async (
    userData: RegisterInput,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    let userCredential: any;
    let firestoreDocCreated = false;
    setLoadingAuth(true);
    setIsRegistering(true);

    try {
      const newUserDocData: UserDataFromFirestore = {
        ...userData,
        registrationDate: Timestamp.now(),
        averageRating: 0,
        numberOfRatings: 0,
      };

      let validatedData: UserDataFromFirestore;
      try {
        validatedData = UserSchema.parse(newUserDocData);
        console.log('Register: User data validated successfully.');
      } catch (zodError) {
        if (zodError instanceof z.ZodError) {
          zodError.issues.forEach((issue) =>
            console.error(
              'Register Zod Validation Error:',
              issue.path.join('.') + ': ' + issue.message,
            ),
          );
        } else {
          console.error('Register Validation Error:', zodError);
        }
        return {
          success: false,
          error: 'Provided data is invalid. Please check your inputs.',
        };
      }

      userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        password,
      );
      const firebaseUser = userCredential.user;
      console.log('Register: Firebase user created:', firebaseUser.uid);

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, validatedData);
      firestoreDocCreated = true;
      console.log(
        'Register: Firestore document created for user:',
        firebaseUser.uid,
      );

      await firebaseUpdateProfile(firebaseUser, { displayName: userData.name });
      console.log('Register: Firebase profile updated with display name.');

      const fullUser: User = { id: firebaseUser.uid, ...validatedData };
      setCurrentUser(fullUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('@user', JSON.stringify(fullUser));
      console.log('Register Success: User account created and data saved.');

      // Register push token after successful registration
      await handlePushTokenRegistration(firebaseUser.uid);

      return { success: true };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      console.error('Register Error:', error.message);

      const currentFirebaseUser = auth.currentUser;
      const createdUserId = userCredential?.user?.uid;

      if (
        createdUserId &&
        currentFirebaseUser &&
        currentFirebaseUser.uid === createdUserId &&
        error.code !== 'auth/email-already-in-use'
      ) {
        try {
          console.warn(
            'Register Error: Attempting to rollback - deleting Firebase Auth user.',
          );
          await currentFirebaseUser.delete();
          console.log(
            'Register Error: Firebase Auth user deleted successfully.',
          );
        } catch (deleteAuthError: any) {
          console.error(
            'Register Error: Failed to delete Firebase Auth user during rollback:',
            deleteAuthError.message,
          );
        }
      }

      if (createdUserId && firestoreDocCreated) {
        try {
          console.warn(
            'Register Error: Attempting to rollback - deleting Firestore document.',
          );
          await deleteDoc(doc(db, 'users', createdUserId));
          console.log(
            'Register Error: Firestore document deleted successfully.',
          );
        } catch (deleteFirestoreError: any) {
          console.error(
            'Register Error: Failed to delete Firestore document during rollback:',
            deleteFirestoreError.message,
          );
        }
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsRegistering(false); // Ensure registration flag is reset
      setLoadingAuth(false);
    }
  };

  const logout = async () => {
    setLoadingAuth(true);
    try {
      await signOut(auth);
      console.log('Logout Success: User logged out.');
    } catch (error: any) {
      console.error('Logout Error:', error.message);
    } finally {
      setLoadingAuth(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser || !auth.currentUser) {
      console.warn('Update Profile: No current user or Firebase user found.');
      return false;
    }

    setLoadingAuth(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.id);

      const updatesForFirestore: Partial<UserDataFromFirestore> = {};
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          const value = updates[key as keyof Partial<User>];
          if (key === 'registrationDate' && value instanceof Date) {
            updatesForFirestore[key as keyof Partial<UserDataFromFirestore>] =
              Timestamp.fromDate(value) as any;
          } else {
            updatesForFirestore[key as keyof Partial<UserDataFromFirestore>] =
              value as any;
          }
        }
      }

      const validatedUpdates = UserSchema.partial().parse(updatesForFirestore);
      console.log('Update Profile: Updates validated:', validatedUpdates);

      await updateDoc(userDocRef, validatedUpdates);
      console.log('Update Profile: Firestore document updated.');

      if (
        validatedUpdates.name &&
        auth.currentUser.displayName !== validatedUpdates.name
      ) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: validatedUpdates.name,
        });
        console.log('Update Profile: Firebase display name updated.');
      }

      const updatedUser = { ...currentUser, ...validatedUpdates };
      setCurrentUser(updatedUser);
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      console.log(
        'Update Profile Success: User data updated in state and AsyncStorage.',
      );
      return true;
    } catch (error: any) {
      console.error('Update Profile Error:', error.message);
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
