// Spinner.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export const Spinner = ({ size = 'large', color = '#3B82F6', style = {} }) => {
  return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

// Alternative with custom styling options
export const CustomSpinner = ({ 
  size = 'large', 
  color = '#3B82F6',
  fullScreen = false,
  backgroundColor = 'transparent',
  overlay = false 
}) => {
  const containerStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColor,
    ...(fullScreen && { flex: 1 }),
    ...(overlay && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    }),
  };

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

// If you want to maintain the exact className-like approach
export const SpinnerWithStyle = ({ className = "", size = "large", color = "#3B82F6" }) => {
  // Parse className string to extract styles (simplified example)
  const getStyles = () => {
    const styles = {};
    if (className.includes('flex-1')) styles.flex = 1;
    if (className.includes('mt-4')) styles.marginTop = 16;
    if (className.includes('mb-4')) styles.marginBottom = 16;
    // Add more className mappings as needed
    return styles;
  };

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, getStyles()]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

// Default export
export default Spinner;