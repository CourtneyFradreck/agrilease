import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/Button';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';

// A cross-platform date picker component
const CrossPlatformDatePicker = ({ label, date, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(date || new Date());
  
  // Format date for display
  const formattedDate = date ? dayjs(date).format('MMM D, YYYY') : 'Select date';
  
  // Handle date change from native picker
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      onChange(selectedDate);
    }
  };
  
  // For web, create a set of month/day/year buttons
  const WebDateSelector = () => {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = tempDate ? tempDate.getMonth() : today.getMonth();
    const currentYear = tempDate ? tempDate.getFullYear() : today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
    
    const setMonth = (monthIndex) => {
      const newDate = new Date(tempDate || today);
      newDate.setMonth(monthIndex);
      setTempDate(newDate);
      onChange(newDate);
    };
    
    const setDay = (day) => {
      const newDate = new Date(tempDate || today);
      newDate.setDate(day);
      setTempDate(newDate);
      onChange(newDate);
    };
    
    const setYear = (year) => {
      const newDate = new Date(tempDate || today);
      newDate.setFullYear(year);
      setTempDate(newDate);
      onChange(newDate);
    };
    
    return (
      <View style={styles.webDatePickerContainer}>
        <View style={styles.webDatePickerHeader}>
          <Text style={styles.webDatePickerTitle}>Select a Date</Text>
          <TouchableOpacity onPress={() => setShowPicker(false)}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.webDatePickerContent}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerColumnTitle}>Month</Text>
            <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
              {months.map((month, index) => (
                <TouchableOpacity 
                  key={month} 
                  style={[
                    styles.pickerItem, 
                    currentMonth === index && styles.pickerItemSelected
                  ]}
                  onPress={() => setMonth(index)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    currentMonth === index && styles.pickerItemTextSelected
                  ]}>{month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerColumnTitle}>Day</Text>
            <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
              {days.map(day => (
                <TouchableOpacity 
                  key={day} 
                  style={[
                    styles.pickerItem, 
                    tempDate && tempDate.getDate() === day && styles.pickerItemSelected
                  ]}
                  onPress={() => setDay(day)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    tempDate && tempDate.getDate() === day && styles.pickerItemTextSelected
                  ]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerColumnTitle}>Year</Text>
            <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
              {years.map(year => (
                <TouchableOpacity 
                  key={year} 
                  style={[
                    styles.pickerItem, 
                    tempDate && tempDate.getFullYear() === year && styles.pickerItemSelected
                  ]}
                  onPress={() => setYear(year)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    tempDate && tempDate.getFullYear() === year && styles.pickerItemTextSelected
                  ]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.webDatePickerFooter}>
          <Button 
            onPress={() => setShowPicker(false)} 
            text="Done" 
            style={styles.doneButton}
          />
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.datePickerContainer}>
      <Text style={styles.datePickerLabel}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.datePickerButton} 
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.datePickerButtonText}>{formattedDate}</Text>
        <MaterialIcons name="calendar-today" size={20} color="#4D7C0F" />
      </TouchableOpacity>
      
      {showPicker && (
        Platform.OS === 'web' ? (
          <Modal
            visible={showPicker}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.webModalContainer}>
              <WebDateSelector />
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={tempDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )
      )}
    </View>
  );
};

const BookingRequest = () => {
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
  
  const handleStartDateChange = (date) => {
    setStartDate(date);
    // If end date is before start date, adjust it
    if (endDate && date > endDate) {
      // Set end date to be same as start date
      setEndDate(date);
    }
  };
  
  const handleEndDateChange = (date) => {
    if (startDate && date < startDate) {
      Alert.alert('Invalid Date', 'End date cannot be earlier than start date');
      return;
    }
    setEndDate(date);
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
        
        <View style={styles.datePickersContainer}>
          <CrossPlatformDatePicker
            label="Start Date"
            date={startDate}
            onChange={handleStartDateChange}
          />
          
          <CrossPlatformDatePicker
            label="End Date"
            date={endDate}
            onChange={handleEndDateChange}
          />
        </View>
        
        <View style={styles.rentalPeriodContainer}>
          <Text style={styles.rentalPeriodLabel}>Rental Period:</Text>
          <Text style={styles.rentalPeriodValue}>{rentalDays} days</Text>
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
};

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
  datePickersContainer: {
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  datePickerButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  rentalPeriodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  rentalPeriodLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4D7C0F',
  },
  rentalPeriodValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#4D7C0F',
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
  webModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  webDatePickerContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  webDatePickerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
  },
  webDatePickerContent: {
    flexDirection: 'row',
    padding: 16,
  },
  webDatePickerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'flex-end',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerColumnTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  pickerScrollView: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#E5F2DC',
  },
  pickerItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    fontFamily: 'Inter-Bold',
    color: '#4D7C0F',
  },
  doneButton: {
    width: 100,
  },
});

export default BookingRequest;