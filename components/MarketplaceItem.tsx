import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native"
import type { MarketplaceItem as MarketplaceItemType } from "@/types/equipment"
import { MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

interface MarketplaceItemProps {
  item: MarketplaceItemType
}

export function MarketplaceItem({ item }: MarketplaceItemProps) {
  const handleShowDetails = () => {
    Alert.alert(
      item.title,
      `${item.description}\n\nLocation: ${item.location}\nCondition: ${item.condition}\nYear: ${item.year}`,
      [
        { text: "Contact Seller", onPress: () => handleContact() },
        { text: "Close", style: "cancel" },
      ],
    )
  }

  const handleContact = () => {
    Alert.alert("Contact Seller", "How would you like to contact the seller?", [
      { text: "Call", onPress: () => console.log("Call seller") },
      { text: "Message", onPress: () => console.log("Message seller") },
      { text: "Cancel", style: "cancel" },
    ])
  }

  // Get the best image to display (Firebase Storage URL or fallback)
  const getImageUrl = () => {
    // Priority: mainImage (Firebase Storage) > first image in array > old image field > placeholder
    if (item.mainImage) {
      return item.mainImage
    }
    if (item.images && item.images.length > 0) {
      return item.images[0].url
    }
    if (item.image) {
      return item.image
    }
    return "https://via.placeholder.com/150?text=No+Image"
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleShowDetails}>
      <Image source={{ uri: getImageUrl() }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>

          <View style={styles.conditionContainer}>
            <Text style={styles.conditionText}>{item.condition}</Text>
          </View>

          <View style={styles.yearContainer}>
            <Text style={styles.yearText}>{item.year}</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.price?.toFixed(2)}</Text>

          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={() => console.log("Call seller")}>
              <Feather name="phone" size={18} color="#4D7C0F" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton} onPress={() => console.log("Message seller")}>
              <MaterialCommunityIcons name="message-text" size={18} color="#4D7C0F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Show image count if multiple images */}
        {item.images && item.images.length > 1 && (
          <View style={styles.imageCountContainer}>
            <MaterialIcons name="photo-library" size={16} color="#6B7280" />
            <Text style={styles.imageCountText}>{item.images.length} photos</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#333333",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  typeContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  typeText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#4B5563",
  },
  conditionContainer: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  conditionText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#4D7C0F",
  },
  yearContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  yearText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#4B5563",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontFamily: "Inter-Bold",
    fontSize: 20,
    color: "#4D7C0F",
  },
  contactButtons: {
    flexDirection: "row",
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  imageCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  imageCountText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
})
