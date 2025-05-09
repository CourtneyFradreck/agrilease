import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Button } from './Button';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FilterModal({ visible, onClose }: FilterModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number] | null>(null);
  
  // Equipment types
  const equipmentTypes = [
    'Tractors', 'Harvesters', 'Seeders', 'Sprayers', 'Tillage', 'Irrigation', 'Others'
  ];
  
  // Distance options (in km)
  const distanceOptions = [5, 10, 25, 50, 100];
  
  // Price range options
  const priceRangeOptions: [number, number][] = [
    [0, 50],
    [50, 100],
    [100, 200],
    [200, 500],
    [500, 1000]
  ];
  
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedDistance(null);
    setSelectedPriceRange(null);
  };
  
  const handleApply = () => {
    // Here we would apply the filters to the parent component
    // For now, just close the modal
    onClose();
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Filter Equipment</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <AntDesign name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.content}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Equipment Type</Text>
                  <View style={styles.optionsGrid}>
                    {equipmentTypes.map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeOption,
                          selectedTypes.includes(type) && styles.typeOptionActive
                        ]}
                        onPress={() => toggleType(type)}
                      >
                        <Text style={[
                          styles.typeOptionText,
                          selectedTypes.includes(type) && styles.typeOptionTextActive
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Distance</Text>
                  <View style={styles.optionsRow}>
                    {distanceOptions.map(distance => (
                      <TouchableOpacity
                        key={distance}
                        style={[
                          styles.distanceOption,
                          selectedDistance === distance && styles.distanceOptionActive
                        ]}
                        onPress={() => setSelectedDistance(distance)}
                      >
                        <Text style={[
                          styles.distanceOptionText,
                          selectedDistance === distance && styles.distanceOptionTextActive
                        ]}>
                          {distance} km
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Price Range (per day)</Text>
                  <View style={styles.priceOptionsContainer}>
                    {priceRangeOptions.map((range, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.priceOption,
                          selectedPriceRange?.[0] === range[0] && selectedPriceRange?.[1] === range[1] && 
                            styles.priceOptionActive
                        ]}
                        onPress={() => setSelectedPriceRange(range)}
                      >
                        <Text style={[
                          styles.priceOptionText,
                          selectedPriceRange?.[0] === range[0] && selectedPriceRange?.[1] === range[1] && 
                            styles.priceOptionTextActive
                        ]}>
                          ${range[0]} - ${range[1]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.footer}>
                <Button 
                  text="Reset" 
                  variant="secondary"
                  onPress={handleReset}
                  style={styles.resetButton}
                />
                <Button 
                  text="Apply Filters" 
                  onPress={handleApply}
                  style={styles.applyButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  typeOptionActive: {
    backgroundColor: '#4D7C0F',
  },
  typeOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  distanceOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  distanceOptionActive: {
    backgroundColor: '#4D7C0F',
  },
  distanceOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  distanceOptionTextActive: {
    color: '#FFFFFF',
  },
  priceOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  priceOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  priceOptionActive: {
    backgroundColor: '#4D7C0F',
  },
  priceOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  priceOptionTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
});