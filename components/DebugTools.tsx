import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useData } from '@/context/DataContext';

export const DebugTools = () => {
  const { resetToMockData } = useData();

  const clearAllStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'All AsyncStorage data cleared');
    } catch (error) {
      console.error('Error clearing storage:', error);
      Alert.alert('Error', 'Failed to clear storage');
    }
  };

  const checkStorageData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let allData = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        allData[key] = value;
      }
      
      console.log('All AsyncStorage data:', allData);
      Alert.alert('Storage Data', `Found ${keys.length} items. See console for details.`);
    } catch (error) {
      console.error('Error checking storage:', error);
      Alert.alert('Error', 'Failed to check storage');
    }
  };

  const forceResetData = async () => {
    try {
      // First clear relevant keys
      await AsyncStorage.removeItem('@rentalEquipment');
      await AsyncStorage.removeItem('@marketplaceItems');
      await AsyncStorage.removeItem('@bookings');
      
      // Then call the resetToMockData function
      resetToMockData();
      
      Alert.alert('Success', 'Forced data reset completed');
      
      // Check what was stored
      setTimeout(async () => {
        const data = await AsyncStorage.getItem('@rentalEquipment');
        console.log('New rental equipment data:', data);
      }, 1000);
    } catch (error) {
      console.error('Error in force reset:', error);
      Alert.alert('Error', 'Force reset failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Tools</Text>
      <TouchableOpacity style={styles.button} onPress={checkStorageData}>
        <Text style={styles.buttonText}>Check Storage</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={clearAllStorage}>
        <Text style={styles.buttonText}>Clear All Storage</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={forceResetData}>
        <Text style={styles.buttonText}>Force Reset Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#6B7280',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});