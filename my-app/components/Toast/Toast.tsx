import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onHide }) => {
  const opacity = new Animated.Value(0);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'times-circle';
      case 'warning':
        return 'exclamation-circle';
      case 'info':
        return 'info-circle';
      default:
        return 'bell';
    }
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        delay: 2400,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  }, []);

  return (
    <Animated.View style={{ opacity }} className="absolute top-10 left-4 right-4">
      <TouchableOpacity
        onPress={onHide}
        className={`${getToastStyle()} rounded-lg p-4 flex-row items-center shadow-lg`}
      >
        <FontAwesome5 name={getIcon()} size={20} color="white" />
        <Text className="flex-1 text-white font-medium ml-3">{message}</Text>
        <FontAwesome5 name="times" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};