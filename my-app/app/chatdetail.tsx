import {
  Text,
  View,
  Image,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ActionSheetIOS,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { chatDB, uploadImageChat, uploadToFirebase } from "@/firebase-config";
import { launchImageLibrary } from "react-native-image-picker";
import { useGetUserProfileQuery } from "@/redux/services/user.service";

import * as ImagePicker from "expo-image-picker";
const ChatDetail = ({
  chatId,
  senderId,
  receiverId,
}: {
  chatId: string;
  senderId: any;
  receiverId: any;
}) => {
  const [chat, setChat] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { data: senderUser } = useGetUserProfileQuery({ userId: senderId });
  const { data: receiverUser } = useGetUserProfileQuery({ userId: receiverId });
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const unSub = onSnapshot(doc(chatDB, "chats", chatId || ""), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    if (chat?.messages) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [chat?.messages]);

  const handleSendMessage = async () => {
    if (message.trim() === "" && selectedImages.length === 0) return;

    const newMessage = {
      senderId,
      text: message,
      images: selectedImages,
      createdAt: new Date(),
    };

    await updateDoc(doc(chatDB, "chats", chatId), {
      messages: arrayUnion(newMessage),
      updatedAt: new Date(),
    });

    setMessage("");
    setSelectedImages([]);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleCaptureImage = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      //   console.log(result.assets);

      if (!result.canceled) {
        uploadImageChat(result.assets[0]).then((url) => {
          setSelectedImages([...selectedImages, url]);
        });
      }
    } catch (error) {}
  };
  const handleSelectImageFromGallery = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      //   console.log(result.assets);

      if (!result.canceled) {
        uploadImageChat(result.assets[0]).then((url) => {
          setSelectedImages([...selectedImages, url]);
        });
      }
    } catch (error) {}
  };
  const handleSelectImage = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chụp ảnh", "Chọn ảnh từ thư viện"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCaptureImage();
          } else if (buttonIndex === 2) {
            handleSelectImageFromGallery();
          }
        }
      );
    } else {
      // Handle Android action sheet or modal
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  const renderMessage = ({ item }: any) => {
    const isSender = item.senderId === senderId;
    const senderName = isSender ? senderUser?.fullName : receiverUser?.fullName;
    return (
      // <View
      //   style={{
      //     alignSelf: isSender ? "flex-end" : "flex-start",
      //     backgroundColor: isSender ? "#007bff" : "#e5e5ea",
      //     borderRadius: 10,
      //     marginVertical: 5,
      //     padding: 10,
      //     maxWidth: "80%",
      //   }}
      // >
      //   <Text style={{ color: isSender ? "#fff" : "#000" }}>{senderName}</Text>

      //   <Text style={{ color: isSender ? "#fff" : "#000", fontSize: 16 }}>
      //     {item.text}
      //   </Text>
      //   <Text style={{ color: isSender ? "#fff" : "#000" }}>
      //     {new Date(item.createdAt.seconds * 1000).toLocaleString()}
      //   </Text>
      //   {item.images && item.images.length > 0 && (
      //     <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      //       {item.images.map((image: string, index: number) => (
      //         <Image
      //           key={index}
      //           source={{ uri: image }}
      //           style={{ width: 200, height: 200, margin: 5 }}
      //           onError={(e) =>
      //             console.log("Error loading image:", e.nativeEvent.error)
      //           }
      //         />
      //       ))}
      //     </View>
      //   )}
      // </View>
      <View
        style={{
          alignSelf: isSender ? "flex-end" : "flex-start",
          marginVertical: 5,
          maxWidth: "80%",
        }}
      >
        {/* Tên người gửi */}
        <Text
          style={{
            color: isSender ? "#007bff" : "#666",
            fontWeight: "600",
            fontSize: 13,
            marginBottom: 2,
            marginLeft: isSender ? 0 : 12,
          }}
        >
          {senderName}
        </Text>

        {/* Message container */}
        <View
          style={{
            backgroundColor: isSender ? "#007bff" : "#e5e5ea",
            borderRadius: 16,
            padding: 12,
            borderTopRightRadius: isSender ? 4 : 16,
            borderTopLeftRadius: isSender ? 16 : 4,
          }}
        >
          {/* Message text */}
          <Text
            style={{
              color: isSender ? "#fff" : "#000",
              fontSize: 15,
              lineHeight: 20,
              marginBottom: item.images?.length > 0 ? 8 : 0,
            }}
          >
            {item.text}
          </Text>

          {/* Images grid */}
          {item.images && item.images.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 4,
              }}
            >
              {item.images.map((image: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{
                    width: item.images.length === 1 ? 200 : 100,
                    height: item.images.length === 1 ? 200 : 100,
                    borderRadius: 8,
                  }}
                  onError={(e) =>
                    console.log("Error loading image:", e.nativeEvent.error)
                  }
                />
              ))}
            </View>
          )}

          {/* Timestamp */}
          <Text
            style={{
              color: isSender ? "rgba(255,255,255,0.7)" : "#666",
              fontSize: 11,
              marginTop: 4,
              alignSelf: "flex-end",
            }}
          >
            {formatTime(item.createdAt.seconds)}
          </Text>
        </View>

        {/* Date separator if needed */}
        {item.showDate && (
          <View
            style={{
              alignItems: "center",
              marginVertical: 16,
            }}
          >
            <Text
              style={{
                backgroundColor: "#f0f0f0",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                color: "#666",
                fontSize: 12,
              }}
            >
              {formatDate(item.createdAt.seconds)}
            </Text>
          </View>
        )}
      </View>
    );
  };
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {chat ? (
        <FlatList
          ref={flatListRef}
          data={chat.messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
          extraData={chat.messages} // Force re-render when messages change
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      ) : (
        <Text>Đang tải</Text>
      )}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn"
          style={{
            flex: 1,
            borderColor: "#ccc",
            borderWidth: 1,
            padding: 8,
            borderRadius: 8,
          }}
        />
        <TouchableOpacity
          onPress={handleSelectImage}
          style={{ marginLeft: 8 }}
        ></TouchableOpacity>
        <Button title="Gửi" onPress={handleSendMessage} />
      </View>
      {selectedImages.length > 0 && (
        <View>
          {selectedImages.map((item, index) => (
            <View key={index.toString()} style={{ margin: 5 }}>
              <Image
                source={{ uri: item }}
                style={{ width: 200, height: 200 }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ChatDetail;
