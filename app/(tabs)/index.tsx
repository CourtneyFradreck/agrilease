import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Filter, Search, RefreshCw } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { EquipmentCard } from '@/components/EquipmentCard';
import { FilterModal } from '@/components/FilterModal';

export default function Dashboard() {
  const router = useRouter();
  const { rentalEquipment, resetToMockData } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filteredEquipment, setFilteredEquipment] = useState(rentalEquipment);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Equipment categories for filter buttons
  const categories = [
    'All', 'Tractors', 'Harvesters', 'Seeders', 'Sprayers', 'Tillage'
  ];

  useEffect(() => {
    filterEquipment(searchQuery, activeFilter);
  }, [searchQuery, activeFilter, rentalEquipment]);

  const filterEquipment = (query: string, category: string | null) => {
    let filtered = rentalEquipment;
    
    // Apply search query filter
    if (query) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category && category !== 'All') {
      filtered = filtered.filter(item => 
        item.type === category
      );
    }
    
    setFilteredEquipment(filtered);
  };

  const handleCategoryPress = (category: string) => {
    setActiveFilter(category === 'All' ? null : category);
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset Data",
      "Are you sure you want to reset all data to defaults?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: () => {
            resetToMockData();
            Alert.alert("Success", "Data has been reset to defaults");
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderCategoryButton = (category: string) => {
    const isActive = (category === 'All' && activeFilter === null) || category === activeFilter;
    
    return (
      <TouchableOpacity
        key={category}
        style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
        onPress={() => handleCategoryPress(category)}
      >
        <Text 
          style={[styles.categoryButtonText, isActive && styles.categoryButtonTextActive]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            placeholderTextColor="#A3A3A3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Filter size={20} color="#4D7C0F" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => renderCategoryButton(category))}
        </ScrollView>
        
        {/* Reset data button */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetData}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {filteredEquipment.length > 0 ? (
        <FlatList
          data={filteredEquipment}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EquipmentCard 
              equipment={item} 
              onPress={() => router.push(`/equipment/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No equipment found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filter criteria
          </Text>
        </View>
      )}

      <FilterModal 
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  categoriesContainer: {
    flex: 1,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4D7C0F',
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D7C0F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});