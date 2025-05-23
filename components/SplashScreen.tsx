import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface SplashScreenProps {
    onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, 3000); // 3 seconds duration
    
        return () => clearTimeout(timer);
    }, [onComplete]);
    
    if (!isVisible) {
        return null; // Don't render anything if the splash screen is not visible
    }
    
    return (
        <View style={styles.container}>
            <Image source={require('@/assets/images/favicon.png')} style={styles.image} />
            <Text style={styles.text}>Bridging Farmer with Marchinery for Sustainable Agriculture</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {    
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#27ae60', // money green
    },    image: {
        width: '90%',
        height: '50%', // Reduced height to make room for text
        resizeMode: 'contain',
        marginBottom: 20, // Add space between image and text
    },  
    text: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontFamily: 'Inter-Bold',
    }
});