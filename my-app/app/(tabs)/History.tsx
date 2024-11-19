import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
 
// import { format } from "date-fns";
// import { vi } from "date-fns/locale";
import { useGetVisitorSessionsQuery } from "@/redux/services/visitorSession.service";
import { VisitorSessionType } from "@/Types/VisitorSession.Type";

const History = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useGetVisitorSessionsQuery({
    pageNumber: page,
    pageSize: 10,
  });

  // const formatDateTime = (dateString: string) => {
  //   return format(new Date(dateString), "HH:mm - dd/MM/yyyy", { locale: vi });
  // };

  console.log("His:", data);
  

  const renderSessionCard = ({ item }: { item: VisitorSessionType }) => (
    <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
 
      <View className="flex-row justify-between items-center mb-4">
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-600 font-medium">#{item.visitorSessionId}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            item.status === "CheckOut" ? "bg-green-100" : "bg-yellow-100"
          }`}
        >
          <Text
            className={`font-medium ${
              item.status === "CheckOut" ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>

 
      <View className="bg-gray-50 rounded-lg p-4 mb-3">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="login" size={20} color="#059669" />
          <Text className="font-medium text-gray-800 ml-2">Check-in</Text>
        </View>
        <View className="ml-7">
          <Text className="text-gray-600 mb-1">
            Thời gian: {item.checkinTime}
          </Text>
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="security" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-1">
              Bảo vệ: {item.securityIn.fullName}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="door-front" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-1">
              Cổng vào: {item.gateIn.gateName}
            </Text>
          </View>
        </View>
      </View>

 
      {item.checkoutTime && (
        <View className="bg-gray-50 rounded-lg p-4">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="logout" size={20} color="#DC2626" />
            <Text className="font-medium text-gray-800 ml-2">Check-out</Text>
          </View>
          <View className="ml-7">
            <Text className="text-gray-600 mb-1">
              Thời gian: {item.checkoutTime}
            </Text>
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="security" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">
                Bảo vệ: {item.securityOut.fullName}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="door-front" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">
                Cổng ra: {item.gateOut.gateName}
              </Text>
            </View>
          </View>
        </View>
      )}

  
      {item.images.length > 0 && (
        <View className="mt-4">
          <Text className="font-medium text-gray-800 mb-2">Hình ảnh</Text>
          <FlatList
            data={item.images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(img) => img.visitorSessionsImageId.toString()}
            renderItem={({ item: image }) => (
              <View className="mr-2">
                <Image
                  source={{ uri: image.imageURL }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
                <Text className="text-xs text-gray-500 mt-1">
                  {image.imageType}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
 
      <View className="bg-white shadow-sm">
        <View className="pt-14 pb-4 px-4">
          <Text className="text-xl font-bold text-gray-800">
            Lịch sử ra/vào
          </Text>
        </View>
      </View>

  
      <FlatList
        data={data?.items}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.visitorSessionId.toString()}
        // contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-8">
              <MaterialIcons name="history" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg mt-4">
                Không có lịch sử ra/vào
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetching && !isLoading ? (
            <ActivityIndicator size="small" color="#6366F1" className="py-4" />
          ) : null
        }
        onEndReached={() => {
          if (data && data.items.length < data.totalCount) {
            setPage((prev) => prev + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default History;