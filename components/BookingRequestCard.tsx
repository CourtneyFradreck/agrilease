import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { router } from 'expo-router';

export default function BookingRequestCard({ request }) {
  const handleAccept = async () => {
    try {
      await updateDoc(doc(db, 'bookings', request.id), {
        status: 'accepted',
      });
      Alert.alert('Success', 'Booking request accepted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept booking request.');
    }
  };

  const handleReject = async () => {
    try {
      await updateDoc(doc(db, 'bookings', request.id), {
        status: 'rejected',
      });
      Alert.alert('Success', 'Booking request rejected.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject booking request.');
    }
  };

  const handleMessage = () => {
    router.push(`/messages/${request.requesterId}`);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{request.equipmentName}</Text>
      <Text>Requester: {request.requesterName}</Text>
      <Text>Start Date: {new Date(request.startDate.seconds * 1000).toLocaleDateString()}</Text>
      <Text>End Date: {new Date(request.endDate.seconds * 1000).toLocaleDateString()}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleAccept}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReject}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleMessage}>
          <Text style={styles.buttonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4D7C0F',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});