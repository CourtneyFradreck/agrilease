import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/Button';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { Calendar, LocaleConfig } from 'react-native-calendars';

interface DayPressEvent {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const CALENDAR_TODAY_BG = '#F0FDF4';
const CALENDAR_RANGE_BG = '#D4EDD4';
const ERROR_RED = '#DC2626';

export default function BookingPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRentalEquipmentById, createBooking } = useData();

  const equipment = getRentalEquipmentById(id);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  if (!equipment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Equipment not found</Text>
        <Button
          onPress={() => router.back()}
          text="Go Back"
          style={styles.goBackButton}
        />
      </View>
    );
  }

  const handleDayPress = useCallback(
    (day: DayPressEvent) => {
      const selectedMoment = dayjs(day.dateString);

      if (!startDate || selectedMoment.isBefore(dayjs(startDate), 'day')) {
        setStartDate(selectedMoment.toDate());
        setEndDate(null);
      } else if (
        startDate &&
        !endDate &&
        selectedMoment.isSameOrAfter(dayjs(startDate), 'day')
      ) {
        setEndDate(selectedMoment.toDate());
      } else if (startDate && endDate) {
        setStartDate(selectedMoment.toDate());
        setEndDate(null);
      }
    },
    [startDate, endDate],
  );

  const rentalDays = useMemo(() => {
    if (startDate && endDate) {
      const diffDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
      return Math.max(1, diffDays);
    }
    return 0;
  }, [startDate, endDate]);

  const totalPrice = rentalDays * (equipment.rentalPrice || 0);

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please select both start and end dates.');
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
      Alert.alert(
        'Invalid Dates',
        'End date cannot be earlier than start date.',
      );
      return;
    }

    try {
      await createBooking({
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
            onPress: () => router.push('/(tabs)'),
          },
        ],
      );
    } catch (error) {
      console.error('Failed to create booking:', error);
      Alert.alert(
        'Booking Failed',
        'There was an issue sending your booking request. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  const isSubmitDisabled = !startDate || !endDate || rentalDays <= 0;

  const markedDates = useMemo(() => {
    const dates: { [key: string]: any } = {};
    const today = dayjs().format('YYYY-MM-DD');

    dates[today] = {
      ...dates[today],
      customStyles: {
        container: {
          backgroundColor: CALENDAR_TODAY_BG,
          borderRadius: BORDER_RADIUS / 2,
        },
        text: {
          color: MAIN_COLOR,
          fontFamily: 'Archivo-Bold',
        },
      },
    };

    if (startDate && endDate) {
      let currentDate = dayjs(startDate);
      while (currentDate.isSameOrBefore(dayjs(endDate), 'day')) {
        const dateString = currentDate.format('YYYY-MM-DD');
        dates[dateString] = {
          color: CALENDAR_RANGE_BG,
          textColor: TEXT_PRIMARY_DARK,
          startingDay: currentDate.isSame(dayjs(startDate), 'day'),
          endingDay: currentDate.isSame(dayjs(endDate), 'day'),
          customStyles: {
            container: {
              backgroundColor: CALENDAR_RANGE_BG,
              borderRadius: 0,
              ...(currentDate.isSame(dayjs(startDate), 'day') && {
                borderTopLeftRadius: BORDER_RADIUS / 2,
                borderBottomLeftRadius: BORDER_RADIUS / 2,
              }),
              ...(currentDate.isSame(dayjs(endDate), 'day') && {
                borderTopRightRadius: BORDER_RADIUS / 2,
                borderBottomRightRadius: BORDER_RADIUS / 2,
              }),
            },
            text: {
              color: TEXT_PRIMARY_DARK,
            },
          },
        };
        currentDate = currentDate.add(1, 'day');
      }
    } else if (startDate) {
      const dateString = dayjs(startDate).format('YYYY-MM-DD');
      dates[dateString] = {
        selected: true,
        startingDay: true,
        endingDay: true,
        color: CALENDAR_RANGE_BG,
        textColor: TEXT_PRIMARY_DARK,
        customStyles: {
          container: {
            backgroundColor: CALENDAR_RANGE_BG,
            borderRadius: BORDER_RADIUS / 2,
          },
          text: {
            color: TEXT_PRIMARY_DARK,
          },
        },
      };
    }
    return dates;
  }, [startDate, endDate]);

  const { name, rentalPrice } = equipment;

  return (
    <View style={styles.fullScreenContainer}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back to previous screen"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={HEADER_TEXT_COLOR}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 24 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.equipmentSummary}>
          <Text style={styles.summaryTitle}>Requesting to Rent</Text>
          <Text style={styles.equipmentName}>{name}</Text>
          <Text style={styles.equipmentPrice}>
            ${rentalPrice?.toFixed(2)} per day
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="calendar-today" size={22} color={MAIN_COLOR} />
            <Text style={styles.sectionTitle}>Select Rental Dates</Text>
          </View>

          <TouchableOpacity
            style={styles.selectDatesButton}
            onPress={() => setIsCalendarVisible(true)}
            accessibilityLabel={
              startDate && endDate
                ? `Selected dates from ${dayjs(startDate).format(
                    'MMM D',
                  )} to ${dayjs(endDate).format('MMM D')}`
                : 'Select rental dates'
            }
          >
            <Text style={styles.selectDatesButtonText}>
              {startDate && endDate
                ? `${dayjs(startDate).format('MMM D, YYYY')} - ${dayjs(
                    endDate,
                  ).format('MMM D, YYYY')}`
                : 'Tap to select dates'}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={TEXT_PRIMARY_DARK}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryGridItem}>
              <Text style={styles.summaryItemLabel}>Daily Rate</Text>
              <Text style={styles.summaryItemValue}>
                ${rentalPrice?.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={styles.summaryItemLabel}>Rental Period</Text>
              <Text style={styles.summaryItemValue}>
                {rentalDays > 0 ? `${rentalDays} days` : 'Not selected'}
              </Text>
            </View>
            <View style={[styles.summaryGridItem, styles.summaryTotalItem]}>
              <Text style={styles.summaryTotalLabel}>Total Cost</Text>
              <Text style={styles.summaryTotalValue}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.policySection}>
          <Text style={styles.sectionTitle}>Booking Policies</Text>
          <View style={styles.policyList}>
            <Text style={styles.policyBullet}>
              • Free cancellation up to 48 hours before pickup.
            </Text>
            <Text style={styles.policyBullet}>
              • Equipment insurance is included in your rental.
            </Text>
            <Text style={styles.policyBullet}>
              • Flexible payment options: Pay on pickup or securely through the
              app.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceFooter}>
          <Text style={styles.priceFrom_bottomBar}>Total</Text>
          <Text style={styles.price_bottomBar}>${totalPrice.toFixed(2)}</Text>
        </View>
        <Button
          onPress={handleSubmitRequest}
          text="Submit Request"
          style={styles.submitBookingButton}
          textStyle={styles.submitBookingButtonText}
          disabled={isSubmitDisabled}
          accessibilityLabel="Submit booking request"
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCalendarVisible}
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Your Rental Dates</Text>
            <Calendar
              onDayPress={handleDayPress}
              markingType={'custom'}
              markedDates={markedDates}
              minDate={dayjs().format('YYYY-MM-DD')}
              enableSwipeMonths={true}
              theme={{
                calendarBackground: CARD_BACKGROUND,
                textSectionTitleColor: TEXT_SECONDARY_GREY,
                selectedDayBackgroundColor: MAIN_COLOR,
                selectedDayTextColor: CARD_BACKGROUND,
                todayBackgroundColor: CALENDAR_TODAY_BG,
                todayTextColor: MAIN_COLOR,
                dayTextColor: TEXT_PRIMARY_DARK,
                textDisabledColor: BORDER_GREY,
                dotColor: MAIN_COLOR,
                selectedDotColor: CARD_BACKGROUND,
                arrowColor: MAIN_COLOR,
                monthTextColor: TEXT_PRIMARY_DARK,
                textMonthFontFamily: 'Archivo-Bold',
                textDayHeaderFontFamily: 'Archivo-Medium',
                textDayFontFamily: 'Archivo-Regular',
              }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClear]}
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                accessibilityLabel="Clear selected dates"
              >
                <Text style={styles.modalButtonTextClear}>Clear Dates</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => setIsCalendarVisible(false)}
                accessibilityLabel="Confirm date selection and close calendar"
              >
                <Text style={styles.modalButtonTextConfirm}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 35 : 45,
    paddingBottom: 10,
    backgroundColor: MAIN_COLOR,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  errorText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: ERROR_RED,
    marginBottom: 16,
  },
  goBackButton: {
    width: 150,
  },
  equipmentSummary: {
    backgroundColor: CARD_BACKGROUND,
    padding: 16,
    marginBottom: 16,
    marginTop: 16,
    borderRadius: BORDER_RADIUS,
    marginHorizontal: 15,
    zIndex: 1,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  summaryTitle: {
    fontFamily: 'Archivo-Medium',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 4,
  },
  equipmentName: {
    fontFamily: 'Archivo-Bold',
    fontSize: 20,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
  },
  equipmentPrice: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: MAIN_COLOR,
  },
  section: {
    backgroundColor: CARD_BACKGROUND,
    padding: 16,
    marginBottom: 16,
    borderRadius: BORDER_RADIUS,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginLeft: 8,
  },
  selectDatesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  selectDatesButtonText: {
    fontFamily: 'Archivo-Medium',
    fontSize: 15,
    color: TEXT_PRIMARY_DARK,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryGridItem: {
    width: '48%',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderRadius: BORDER_RADIUS,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    justifyContent: 'space-between',
  },
  summaryItemLabel: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontFamily: 'Archivo-Medium',
    fontSize: 15,
    color: TEXT_PRIMARY_DARK,
  },
  summaryTotalItem: {
    width: '100%',
    backgroundColor: CARD_BACKGROUND,
    borderColor: MAIN_COLOR,
    borderWidth: 2,
    marginTop: 5,
  },
  summaryTotalLabel: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
  },
  summaryTotalValue: {
    fontFamily: 'Archivo-Bold',
    fontSize: 20,
    color: MAIN_COLOR,
  },
  policySection: {
    backgroundColor: CARD_BACKGROUND,
    padding: 16,
    marginBottom: 16,
    borderRadius: BORDER_RADIUS,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  policyList: {
    marginTop: 10,
  },
  policyBullet: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MAIN_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: BORDER_RADIUS * 2,
    borderTopRightRadius: BORDER_RADIUS * 2,
  },
  priceFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceFrom_bottomBar: {
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: HEADER_TEXT_COLOR,
    marginRight: 4,
  },
  price_bottomBar: {
    fontFamily: 'Archivo-Bold',
    fontSize: 22,
    color: HEADER_TEXT_COLOR,
  },
  submitBookingButton: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 25,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BACKGROUND,
  },
  submitBookingButtonText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: MAIN_COLOR,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: '90%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: BORDER_RADIUS * 2,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  modalTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 5,
  },
  modalButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  modalButtonClear: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  modalButtonTextClear: {
    fontFamily: 'Archivo-Medium',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
  },
  modalButtonConfirm: {
    backgroundColor: MAIN_COLOR,
  },
  modalButtonTextConfirm: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: CARD_BACKGROUND,
  },
});
