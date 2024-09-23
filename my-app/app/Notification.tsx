import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  avatar: string;
}

const Notification: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([
    { id: '1', title: 'Hạ Vi', message: 'Quản lí Hạ Vi vừa giao cho bạn một đơn đặt lịch', date: '2024-09-22 14:30', read: false, avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', title: 'Công Hải', message: 'Bạn vừa được giao nhiệm vụ', date: '2024-09-20 09:15', read: true, avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', title: 'Như Mây', message: 'Quản lí Như Mây vừa giao cho bạn một đơn đặt lịch!', date: '2024-09-18 18:45', read: false, avatar: 'https://i.pravatar.cc/150?img=3' },
  ]);

  const markAsRead = (id: string) => {
    setNotices(notices.map(notice => 
      notice.id === id ? { ...notice, read: true } : notice
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderNoticeItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity 
      className={`p-4 border-b border-gray-200 ${item.read ? 'bg-gray-50' : 'bg-white'}`}
      onPress={() => markAsRead(item.id)}
    >
      <View className="flex-row">
        <Image 
          source={{ uri: item.avatar }} 
          className="w-12 h-12 rounded-full mr-4"
        />
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className={`text-lg font-semibold mb-1 ${item.read ? 'text-gray-600' : 'text-black'}`}>
                {item.title}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">{item.message}</Text>
              <Text className="text-xs text-gray-400">{formatDate(item.date)}</Text>
            </View>
            {!item.read && (
              <View className="bg-blue-500 rounded-full w-3 h-3" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1">
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-2xl font-bold">Thông báo</Text>
        </View>
        
        {notices.length > 0 ? (
          <FlatList
            data={notices}
            renderItem={renderNoticeItem}
            keyExtractor={item => item.id}
            className="flex-1"
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Feather name="bell-off" size={48} color="#9CA3AF" />
            <Text className="text-lg text-gray-500 mt-4">Không có thông báo mới</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Notification;