import { View, Text, Image } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';

const notification = () => {
  return (
    <View className="flex-1 bg-backgroundApp items-center justify-center px-6">
      <View className="items-center">
        <Feather name="bell-off" size={80} color="#fff" />
        <Text className="text-white text-2xl font-bold mt-6 mb-2">Coming Soon</Text>
        <Text className="text-white/70 text-center text-base">
          Chức năng thông báo sẽ sớm được cập nhật trong thời gian tới
        </Text>
      </View>
    </View>
  );
};

export default notification;