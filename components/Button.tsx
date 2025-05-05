import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  text,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle[] = [styles.button];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        buttonStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        buttonStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        buttonStyle.push(styles.outlineButton);
        break;
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        buttonStyle.push(styles.smallButton);
        break;
      case 'medium':
        buttonStyle.push(styles.mediumButton);
        break;
      case 'large':
        buttonStyle.push(styles.largeButton);
        break;
    }
    
    // Add disabled style
    if (disabled) {
      buttonStyle.push(styles.disabledButton);
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyles: TextStyle[] = [styles.buttonText];
    
    // Add variant text styles
    switch (variant) {
      case 'primary':
        textStyles.push(styles.primaryButtonText);
        break;
      case 'secondary':
        textStyles.push(styles.secondaryButtonText);
        break;
      case 'outline':
        textStyles.push(styles.outlineButtonText);
        break;
    }
    
    // Add size text styles
    switch (size) {
      case 'small':
        textStyles.push(styles.smallButtonText);
        break;
      case 'medium':
        textStyles.push(styles.mediumButtonText);
        break;
      case 'large':
        textStyles.push(styles.largeButtonText);
        break;
    }
    
    // Add disabled text style
    if (disabled) {
      textStyles.push(styles.disabledButtonText);
    }
    
    return textStyles;
  };
  
  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#FFFFFF' : '#4D7C0F'} 
          size="small" 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={[...getTextStyle(), textStyle]}>{text}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#4D7C0F',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4D7C0F',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  largeButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#4D7C0F',
  },
  outlineButtonText: {
    color: '#4B5563',
  },
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});