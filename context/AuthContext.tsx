import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string, userType: 'farmer' | 'owner') => Promise<boolean>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
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
  
  // Mock users
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      userType: 'farmer',
      location: 'Springfield, IL',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-5678',
      userType: 'owner',
      location: 'Greenfield, OR',
      createdAt: new Date().toISOString(),
    },
  ];
  
  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userJson = await AsyncStorage.getItem('@user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo, we'll use a simple check against mock users
    // In a real app, this would validate against a backend
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // In a real app, we would check the password here
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Store user in AsyncStorage
      try {
        await AsyncStorage.setItem('@user', JSON.stringify(user));
      } catch (error) {
        console.error('Error storing user:', error);
      }
      
      return true;
    }
    
    return false;
  };
  
  const register = async (
    name: string, 
    email: string, 
    phone: string, 
    password: string, 
    userType: 'farmer' | 'owner'
  ): Promise<boolean> => {
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      phone,
      userType,
      location: 'Set your location',
      createdAt: new Date().toISOString(),
    };
    
    // Add to mock users (in a real app, this would be sent to a backend)
    mockUsers.push(newUser);
    
    // Log in the new user
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    
    // Store user in AsyncStorage
    try {
      await AsyncStorage.setItem('@user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Error storing user:', error);
    }
    
    return true;
  };
  
  const logout = async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Remove user from AsyncStorage
    try {
      await AsyncStorage.removeItem('@user');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };
  
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }
    
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    
    // Update in AsyncStorage
    try {
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser, 
      login, 
      register, 
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}