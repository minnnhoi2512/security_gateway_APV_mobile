import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
  FontAwesome6,
} from "@expo/vector-icons";
import {
  useGetVisitorSessionsQuery,
  VisitorSession,
} from "@/redux/services/visitorSession.service";
import { Image } from "react-native";

const History = () => {
  const [selectedSession, setSelectedSession] = useState<VisitorSession | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: historyData,
    isLoading,
    isError,
    refetch,
  } = useGetVisitorSessionsQuery({ pageSize: 10, pageNumber: 1 });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyle = () => {
      switch (status) {
        case "CheckIn":
          return "bg-emerald-500";
        case "CheckOut":
          return "bg-amber-500";
        default:
          return "bg-gray-400";
      }
    };

    return (
      <View
        className={`px-3 py-1.5 rounded-full flex-row items-center ${getStatusStyle()}`}
      >
        <View className="w-2 h-2 rounded-full bg-white/90 mr-2 animate-pulse" />
        <Text className="text-white text-xs font-bold">
          {status === "CheckIn"
            ? "Đã vào"
            : status === "CheckOut"
            ? "Đã ra"
            : status}
        </Text>
      </View>
    );
  };

  const SessionCard = ({ item }: { item: VisitorSession }) => (
    <Pressable onPress={() => setSelectedSession(item)} className="mb-4 mx-4">
      <View className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <View className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-[#d4efdf] rounded-2xl items-center justify-center shadow-sm">
                <FontAwesome6 name="calendar-day" size={24} color="#1abc9c" />
              </View>
              <View className="ml-4">
                <Text className="text-[#1abc9c] font-bold text-lg">
                  Chuyến thăm #{item.visitorSessionId}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={16}
                    color="#6B7280"
                  />
                  <Text className="text-gray-600 text-xs ml-1.5 font-medium">
                    {formatTime(item.checkinTime)} - {formatTime(item.checkoutTime)}
                  </Text>
                </View>
              </View>
            </View>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </View>
    </Pressable>
  );

  const DetailModal = () => {
    if (!selectedSession) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedSession}
        onRequestClose={() => setSelectedSession(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="card-account-details"
                  size={24}
                  color="#1abc9c"
                />
                <Text className="text-xl font-bold text-[#1abc9c] ml-2">
                  Chi tiết chuyến thăm #{selectedSession.visitorSessionId}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedSession(null)}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
              >
                <Ionicons name="close" size={22} color="#4B5563" />
              </Pressable>
            </View>

            <ScrollView className="px-6 py-4">
              <View className="bg-gradient-to-r from-emerald-50 to-emerald-100/30 rounded-2xl p-5 mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-emerald-200 rounded-full items-center justify-center">
                    <FontAwesome5 name="user-alt" size={18} color="#059669" />
                  </View>
                  <Text className="text-emerald-800 font-bold text-lg ml-3">
                    Thông tin khách
                  </Text>
                </View>
                <View className="space-y-3">
                  <InfoRow
                    icon={
                      <MaterialCommunityIcons
                        name="account"
                        size={20}
                        color="#059669"
                      />
                    }
                    label="Họ tên"
                    value={selectedSession.visitDetail.visitor.visitorName}
                  />
                  <InfoRow
                    icon={
                      <MaterialCommunityIcons
                        name="office-building"
                        size={20}
                        color="#059669"
                      />
                    }
                    label="Công ty"
                    value={selectedSession.visitDetail.visitor.companyName}
                  />
                  <InfoRow
                    icon={
                      <MaterialCommunityIcons
                        name="phone"
                        size={20}
                        color="#059669"
                      />
                    }
                    label="Điện thoại"
                    value={selectedSession.visitDetail.visitor.phoneNumber}
                  />
                </View>
              </View>

              <View className="bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-2xl p-5 mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-blue-200 rounded-full items-center justify-center">
                    <MaterialCommunityIcons
                      name="shield-account"
                      size={22}
                      color="#1d4ed8"
                    />
                  </View>
                  <Text className="text-blue-800 font-bold text-lg ml-3">
                    Thông tin bảo vệ
                  </Text>
                </View>
                <View className="space-y-4">
                  <View className="bg-white/60 rounded-xl p-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="enter-outline"
                        size={18}
                        color="#2563eb"
                      />
                      <Text className="text-blue-600 font-medium ml-2">
                        Bảo vệ vào
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="account-tie"
                        size={20}
                        color="#4B5563"
                      />
                      <Text className="ml-2 text-gray-700 font-medium">
                        {selectedSession.securityIn.fullName}
                      </Text>
                      <Text className="mx-2 text-gray-400">|</Text>
                      <MaterialCommunityIcons
                        name="phone"
                        size={18}
                        color="#4B5563"
                      />
                      <Text className="ml-2 text-gray-700">
                        {selectedSession.securityIn.phoneNumber}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-white/60 rounded-xl p-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="exit-outline" size={18} color="#2563eb" />
                      <Text className="text-blue-600 font-medium ml-2">
                        Bảo vệ ra
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="account-tie"
                        size={20}
                        color="#4B5563"
                      />
                      <Text className="ml-2 text-gray-700 font-medium">
                        {selectedSession.securityOut.fullName}
                      </Text>
                      <Text className="mx-2 text-gray-400">|</Text>
                      <MaterialCommunityIcons
                        name="phone"
                        size={18}
                        color="#4B5563"
                      />
                      <Text className="ml-2 text-gray-700">
                        {selectedSession.securityOut.phoneNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-2xl p-5 mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-amber-200 rounded-full items-center justify-center">
                    <MaterialCommunityIcons
                      name="gate"
                      size={22}
                      color="#b45309"
                    />
                  </View>
                  <Text className="text-amber-800 font-bold text-lg ml-3">
                    Thông tin cổng
                  </Text>
                </View>
                <View className="flex-row space-x-4">
                  <View className="flex-1 bg-white/60 rounded-xl p-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="enter-outline"
                        size={18}
                        color="#d97706"
                      />
                      <Text className="text-amber-600 ml-2">Vào</Text>
                    </View>
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <FontAwesome5
                          name="door-open"
                          size={16}
                          color="#4B5563"
                        />
                        <Text className="ml-2 text-gray-700">
                          {selectedSession.gateIn.gateName}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={18}
                          color="#4B5563"
                        />
                        <Text className="ml-2 text-gray-700">
                          {formatTime(selectedSession.checkinTime)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-white/60 rounded-xl p-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="exit-outline" size={18} color="#d97706" />
                      <Text className="text-amber-600 ml-2">Ra</Text>
                    </View>
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <FontAwesome5
                          name="door-open"
                          size={16}
                          color="#4B5563"
                        />
                        <Text className="ml-2 text-gray-700">
                          {selectedSession.gateOut.gateName}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={18}
                          color="#4B5563"
                        />
                        <Text className="ml-2 text-gray-700">
                          {formatTime(selectedSession.checkoutTime)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {selectedSession.images.length > 0 && (
                <View className="bg-gradient-to-r from-purple-50 to-purple-100/30 rounded-2xl p-5">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 bg-purple-200 rounded-full items-center justify-center">
                      <MaterialCommunityIcons
                        name="image-multiple"
                        size={22}
                        color="#7e22ce"
                      />
                    </View>
                    <Text className="text-purple-800 font-bold text-lg ml-3">
                      Hình ảnh
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap -mx-1">
                    {selectedSession.images.map((image) => (
                      <View key={image.visitorSessionsImageId} className="p-1">
                        <Image
                          source={{ uri: image.imageURL }}
                          className="w-32 h-32 rounded-xl"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <View className="flex-row items-center">
      <View className="w-6 h-6 justify-center items-center">{icon}</View>
      <Text className="text-gray-500 ml-2 w-24 text-base">{label}:</Text>
      <Text className="text-gray-800 flex-1 font-medium text-base">
        {value}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <MaterialCommunityIcons name="loading" size={48} color="#2563EB" />
        <Text className="mt-4 text-gray-600 font-semibold text-lg">
          Đang tải...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color="#EF4444"
        />
        <Text className="mt-4 text-gray-800 text-xl font-semibold">
          Tải dữ liệu thất bại! Vui lòng thử lại sau.
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="flex-row items-center bg-blue-600 px-8 py-3 rounded-xl mt-6 shadow-md active:bg-blue-700"
        >
          <MaterialCommunityIcons name="refresh" size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">Tải lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="mt-5 p-2 items-center">
        <Text className="text-2xl font-bold text-colorTitleHeader">
          Lịch sử ra - vào hôm nay
        </Text>
      </View>
      <View className="flex-1 pt-6">
        <FlatList
          data={historyData}
          renderItem={({ item }) => <SessionCard item={item} />}
          keyExtractor={(item) => item.visitorSessionId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
      <DetailModal />
    </SafeAreaView>
  );
};

export default History;
