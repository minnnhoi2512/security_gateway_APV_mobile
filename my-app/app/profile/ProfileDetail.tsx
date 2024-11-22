import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/redux/services/user.service";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileDetail = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const [updatedData, setUpdatedData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };
    fetchUserId();
  }, []);

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery(userId ? { userId } : { userId: '' }, {
    skip: !userId,
  });

  useEffect(() => {
    if (profile) {
      setUpdatedData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!userId) return;

    const updateDataPass = {
      userName: profile?.userName || "",
      fullName: updatedData.fullName || profile?.fullName || "",
      email: updatedData.email || profile?.email || "",
      phoneNumber: updatedData.phoneNumber || profile?.phoneNumber || "",
      image: profile?.image || "",
      roleID: 5,
      departmentId: profile?.department || 3,
    };

    try {
      await updateProfile({
        userId,
        data: updateDataPass,
      }).unwrap();
      setIsEditing(false);
      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
      refetch();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundApp p-4">
        <Text className="text-white text-center">
          Lỗi tải thông tin. Vui lòng thử lại.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-backgroundApp">
      {/* Header Space */}
      <View className="h-32 mt-[60px] flex-row justify-between items-center px-4 mb-[60px]">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-white/10 p-2 rounded-full"
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setIsEditing(!isEditing)}
          className="bg-white/10 p-2 rounded-full"
        >
          <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>
      </View>
 
      <View className="px-4 -mt-16">
        <View className="bg-white rounded-3xl p-6 shadow-lg">
          {/* Profile Image and Basic Info */}
          <View className="items-center -mt-16 mb-4">
            <Image
              source={{ uri: profile.image }}
              className="w-24 h-24 rounded-full border-4 border-white"
            />
            {isEditing ? (
              <TextInput
                className="text-xl font-bold mt-2 text-center bg-gray-100 p-2 rounded-lg w-full"
                value={updatedData.fullName}
                onChangeText={(text) => setUpdatedData(prev => ({ ...prev, fullName: text }))}
                placeholder="Họ và tên"
              />
            ) : (
              <Text className="text-xl font-bold mt-2">{profile.fullName}</Text>
            )}
            <Text className="text-gray-500">@{profile.userName}</Text>
          </View>

          {/* Role and Status */}
          <View className="flex-row justify-center items-center space-x-2 mb-6">
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-800">{profile.role.roleName}</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${profile.status === 'Active' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`${profile.status === 'Active' ? 'text-green-800' : 'text-red-800'}`}>
                {profile.status}
              </Text>
            </View>
          </View>

          {/* Information Section */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold mb-2">Thông tin liên hệ</Text>
            
            <View className="flex-row items-center">
              <MaterialIcons name="email" size={20} color="#6B7280" />
              <Text className="text-gray-500 ml-4">Email</Text>
              {isEditing ? (
                <TextInput
                  className="text-gray-800 ml-auto bg-gray-100 p-2 rounded-lg flex-1 mx-2"
                  value={updatedData.email}
                  onChangeText={(text) => setUpdatedData(prev => ({ ...prev, email: text }))}
                />
              ) : (
                <Text className="text-gray-800 ml-auto">{profile.email}</Text>
              )}
            </View>

            <View className="flex-row items-center">
              <MaterialIcons name="phone" size={20} color="#6B7280" />
              <Text className="text-gray-500 ml-4">Số điện thoại</Text>
              {isEditing ? (
                <TextInput
                  className="text-gray-800 ml-auto bg-gray-100 p-2 rounded-lg flex-1 mx-2"
                  value={updatedData.phoneNumber}
                  onChangeText={(text) => setUpdatedData(prev => ({ ...prev, phoneNumber: text }))}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="text-gray-800 ml-auto">{profile.phoneNumber}</Text>
              )}
            </View>

            <View className="flex-row items-center">
              <MaterialIcons name="date-range" size={20} color="#6B7280" />
              <Text className="text-gray-500 ml-4">Ngày tạo</Text>
              <Text className="text-gray-800 ml-auto">{formatDate(profile.createdDate)}</Text>
            </View>

            <View className="flex-row items-center">
              <MaterialIcons name="update" size={20} color="#6B7280" />
              <Text className="text-gray-500 ml-4">Cập nhật lần cuối</Text>
              <Text className="text-gray-800 ml-auto">{formatDate(profile.updatedDate)}</Text>
            </View>
          </View>

          {/* Edit Profile Buttons */}
          {isEditing && (
            <View className="mt-6 space-y-2">
              <TouchableOpacity
                className="bg-indigo-600 px-4 py-3 rounded-xl"
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                <Text className="text-white text-center font-semibold">
                  {isUpdating ? "Đang cập nhật..." : "Cập Nhật Thông Tin"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-200 px-4 py-3 rounded-xl"
                onPress={() => setIsEditing(false)}
              >
                <Text className="text-gray-800 text-center font-semibold">Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileDetail;