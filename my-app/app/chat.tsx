import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useGetAllStaffQuery } from "@/redux/services/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatDB } from "@/firebase-config";
import {
  doc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { Guid } from "guid-typescript";
import ChatDetail from "./chatdetail"; // Import ChatDetail component

const Chat = () => {
  const { data: staff } = useGetAllStaffQuery({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(0);
  const [selectedChat, setSelectedChat] = useState<any>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem("userId");
      setCurrentUserId(userId ? parseInt(userId, 10) : null);
      console.log(userId);
    };

    fetchUserId();
  }, []);

  const handleSelect = async (user: any) => {
    try {
      if (!currentUserId) {
        console.error("Current user ID is not set");
        return;
      }

      const chatQuery = query(
        collection(chatDB, "chats"),
        where("participants", "array-contains", currentUserId)
      );

      const chatQuerySnapshot = await getDocs(chatQuery);
      let chatRoomExists = false;
      let chatId = "";

      chatQuerySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Chat data: ", data);
        if (data.participants.includes(user.userId)) {
          chatRoomExists = true;
          chatId = doc.id;
        }
      });

      if (chatRoomExists) {
        setSelectedChat({ chatId, senderId: currentUserId, receiverId: user.userId });
      } else {
        chatId = Guid.create().toString();
        const chatDocRef = doc(chatDB, "chats", chatId);
        await setDoc(chatDocRef, {
          participants: [currentUserId, user.userId],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setSelectedChat({ chatId, senderId: currentUserId, receiverId: user.userId });
      }
    } catch (error) {
      console.error("Error selecting chat: ", error);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => handleSelect(item)}>
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <Image source={{ uri: item.image }} className="w-12 h-12 rounded-full" />
        <View className="ml-4">
          <Text className="text-lg font-bold">{item.fullName}</Text>
          <Text className="text-sm text-gray-500">
            {item.role.roleName === "Staff" ? "Nhân viên" : item.role.roleName}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.department.departmentName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1">
      {selectedChat ? (
        <ChatDetail
          chatId={selectedChat.chatId}
          senderId={selectedChat.senderId}
          receiverId={selectedChat.receiverId}
        />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

export default Chat;