import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/Button';
import dayjs from 'dayjs';

// Only import CalendarPicker on native platforms
let CalendarPicker: any = null;
if (Platform.OS !== 'web') {
  CalendarPicker = require('react-native-calendar-picker').default;
}

export default function BookingRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRentalEquipmentById, createBooking } = useData();
  
  const equipment = getRentalEquipmentById(id);
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  if (!equipment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Equipment not found</Text>
        <Button onPress={() => router.back()} text="Go Back" style={styles.goBackButton} />
      </View>
    );
  }
  
  const handleDateChange = (date: any, type: string) => {
    if (type === 'START_DATE') {
      setStartDate(date?.toDate() || null);
    } else {
      setEndDate(date?.toDate() || null);
    }
  };
  
  const rentalDays = startDate && endDate 
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
    
  const totalPrice = rentalDays * (equipment.rentalPrice || 0);
  
  const handleSubmitRequest = () => {
    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please select both start and end dates');
      return;
    }
    
    if (endDate < startDate) {
      Alert.alert('Invalid Dates', 'End date cannot be earlier than start date');
      return;
    }
    
    createBooking({
      equipmentId: equipment.id,
      startDate,
      endDate,
      totalPrice,
    });
    
    Alert.alert(
      'Booking Request Sent',
      `Your request to rent ${equipment.name} has been sent to the owner. You will be notified once they respond.`,
      [
        { 
          text: 'OK', 
          onPress: () => router.push('/(tabs)') 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.equipmentSummary}>
        <Text style={styles.summaryTitle}>Requesting to Rent</Text>
        <Text style={styles.equipmentName}>{equipment.name}</Text>
        <Text style={styles.equipmentPrice}>
          ${equipment.rentalPrice?.toFixed(2)} per day
        </Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="calendar-today" size={20} color="#4D7C0F" />
          <Text style={styles.sectionTitle}>Select Rental Dates</Text>
        </View>
        
        {Platform.OS !== 'web' && CalendarPicker && (
          <View style={styles.calendarContainer}>
            <CalendarPicker
              startFromMonday={true}
              allowRangeSelection={true}
              minDate={new Date()}
              todayBackgroundColor="#F0FDF4"
              selectedDayColor="#4D7C0F"
              selectedDayTextColor="#FFFFFF"
              onDateChange={handleDateChange}
              textStyle={{
                fontFamily: 'Inter-Regular',
                color: '#4B5563',
              }}
              selectedRangeStartStyle={{
                backgroundColor: '#4D7C0F',
              }}
              selectedRangeEndStyle={{
                backgroundColor: '#4D7C0F',
              }}
              selectedRangeStyle={{
                backgroundColor: '#E5F2DC',
              }}
            />
          </View>
        )}
        
        <View style={styles.datesContainer}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>
              {startDate ? dayjs(startDate).format('MMM D, YYYY') : 'Select date'}
            </Text>
          </View>
          
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>
              {endDate ? dayjs(endDate).format('MMM D, YYYY') : 'Select date'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rental Summary</Text>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rental Period</Text>
            <Text style={styles.summaryValue}>{rentalDays} days</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Daily Rate</Text>
            <Text style={styles.summaryValue}>${equipment.rentalPrice?.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.policySection}>
        <View style={styles.policyItem}>
          <Feather name="check" size={20} color="#4D7C0F" />
          <Text style={styles.policyText}>Free cancellation up to 48 hours before pickup</Text>
        </View>
        
        <View style={styles.policyItem}>
          <Feather name="check" size={20} color="#4D7C0F" />
          <Text style={styles.policyText}>Equipment insurance included</Text>
        </View>
        
        <View style={styles.policyItem}>
          <Feather name="check" size={20} color="#4D7C0F" />
          <Text style={styles.policyText}>Pay on pickup or through the app</Text>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <Button 
          onPress={() => router.back()}
          text="Cancel"
          variant="secondary"
          style={styles.cancelButton}
        />
        
        <Button 
          onPress={handleSubmitRequest}
          text="Submit Request"
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  equipmentSummary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  summaryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  equipmentName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#333333',
    marginBottom: 4,
  },
  equipmentPrice: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4D7C0F',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginLeft: 8,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dateLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
  },
  summaryContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4B5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
  },
  totalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#4D7C0F',
  },
  policySection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  policyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#DC2626',
    marginBottom: 16,
  },
  goBackButton: {
    width: 150,
  },
});