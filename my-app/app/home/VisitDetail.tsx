import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  Button,
  Modal,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetAllVisitsByCurrentDateByIDQuery, useGetVisitDetailByIdQuery } from "@/redux/services/visit.service";
import { VisitDetailType } from "@/redux/Types/visit.type";
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
 
import TruncatableTitle from "@/components/UI/Truncatable/TruncatableTitle";
import { UpdateVisitStatusModal } from "@/components/UI/UpdateVisitStatusModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VisitDetail = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const visitData = data ? JSON.parse(data.toString()) : null;
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDescriptionModalVisible, setDescriptionModalVisible] =
    useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const {
    data: visitDetail,
    isLoading,
    isError,
    refetch,
  } = useGetVisitDetailByIdQuery(visitData.visitId as string);
    const {
    data: visitVsheader,
    isLoading: isLoadingVsh,
    isError: isErrVsh,
    refetch: refetchVsh,
  } = useGetAllVisitsByCurrentDateByIDQuery(visitData.visitId as string);
  console.log(visitData.visitId)

  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      setRole(storedRole);
    };
    fetchRole();
  }, []);

 

  // console.log("visit detail: ", visitVsheader);
  

  const handleGoBack = () => {
    router.back();
  };

  const handleUpdateStatus = () => {
    setIsUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = async () => {
    setIsUpdateModalVisible(false);
    await refetch();
    await refetchVsh();  
  };
  const toggleExpansion = (index: number) => {
    setExpandedItem((prev) => (prev === index ? null : index));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchVsh()]);  
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchVsh]);

  const getPlainDescription = (html: string) => {
    return html.replace(/<[^>]+>/g, "");
  };

  const renderDescription = (description: string, maxLength: number = 100) => {
    const plainDesc = getPlainDescription(description);
    if (plainDesc.length <= maxLength) {
      return <Text className="text-base text-gray-700">{plainDesc}</Text>;
    }
    return (
      <View>
        <Text className="text-base text-gray-700">
          {plainDesc.slice(0, maxLength)}...{" "}
          <Text
            className="text-blue-600 font-bold"
            onPress={() => setDescriptionModalVisible(true)}
          >
            Xem thêm
          </Text>
        </Text>
      </View>
    );
  };

  if (isLoading || isLoadingVsh) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-backgroundApp">
          Đang tải...
        </Text>
      </View>
    );
  }

  if (isError || isErrVsh) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-red-500">
          Chưa tải được dữ liệu.
        </Text>
      </View>
    );
  }

  if (!visitVsheader || !visitVsheader.length) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-xl font-semibold text-red-500">
          Không tìm thấy thông tin lịch hẹn.
        </Text>
      </View>
    );
  }

  const visitInfo = visitVsheader[0];

  return (
    <ScrollView
      className="bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#1abc9c"]}
          tintColor="#1abc9c"
        />
      }
    >
      <View className="relative">
        <Pressable
          onPress={handleGoBack}
          className="absolute top-6 left-2 flex flex-row items-center space-x-2 px-4 py-2 rounded-lg mt-4 z-10"
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
          <Text className="text-white font-medium">Quay về</Text>
        </Pressable>

        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg",
          }}
          className="w-full h-72"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black/40" />
        </ImageBackground>

        <View className="p-4 bottom-[160px]">
          {/* <View className="mb-8">
            <VisitItemDetail visit={visitData} />
          </View> */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-4">
            <View className="items-center mb-6">
              <TruncatableTitle text={visitInfo.visitName} />
              <View>
                {visitInfo.visitStatus === "ActiveTemporary" &&
                  role === "Staff" && (
                    <Button
                      onPress={handleUpdateStatus}
                      title="Cập nhật trạng thái"
                    />
                  )}
                <UpdateVisitStatusModal
                  visit={visitInfo}
                  isVisible={isUpdateModalVisible}
                  onClose={handleCloseUpdateModal}
                />
              </View>
              <View>
                {visitInfo.visitStatus === "Violation" &&
                  role === "Security" && (
                    <Button
                      onPress={handleUpdateStatus}
                      title="Xác nhận xử lý vi phạm"
                    />
                  )}
                <UpdateVisitStatusModal
                  visit={visitInfo}
                  isVisible={isUpdateModalVisible}
                  onClose={handleCloseUpdateModal}
                />
              </View>
              <View className="flex-row items-center space-x-2">
                <Text className="text-lg font-semibold text-gray-600">
                  {visitInfo.visitDetailStartTime
                    ?.split(":")
                    .slice(0, 2)
                    .join(":")}
                </Text>
                <Text className="text-lg font-semibold text-gray-400">-</Text>
                <Text className="text-lg font-semibold text-gray-600">
                  {visitInfo.visitDetailEndTime
                    ?.split(":")
                    .slice(0, 2)
                    .join(":")}
                </Text>
                <Text className="italic text-[#2ecc71]">(Dự kiến)</Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-6">
              <View className="items-center bg-purple-50 rounded-xl px-4 py-2 flex-1 mx-1">
                <FontAwesome5 name="users" size={20} color="#9b59b6" />
                <Text className="text-xs text-gray-500 mt-1">Tổng số</Text>
                <Text className="text-lg font-bold text-purple-600">
                  {visitInfo.visitQuantity}
                </Text>
              </View>
              <View className="items-center bg-blue-50 rounded-xl px-4 py-2 flex-1 mx-1">
                <FontAwesome5 name="user-check" size={20} color="#2980b9" />
                <Text className="text-xs text-gray-500 mt-1">Đã vào</Text>
                <Text className="text-lg font-bold text-blue-600">
                  {visitInfo.visitorCheckkInCount}
                </Text>
              </View>
              <View className="items-center bg-red-50 rounded-xl px-4 py-2 flex-1 mx-1">
                <FontAwesome5 name="user-times" size={20} color="#e74c3c" />
                <Text className="text-xs text-gray-500 mt-1">Đã ra</Text>
                <Text className="text-lg font-bold text-red-600">
                  {visitInfo.visitorCheckkOutCount}
                </Text>
              </View>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <FontAwesome5 name="user-tie" size={18} color="#2980b9" />
                </View>
                <View className="ml-3">
                  <Text className="text-xs text-gray-500">Người tạo</Text>
                  <Text className="text-base font-semibold text-gray-700">
                    {visitInfo.createByname}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  {/* <FontAwesome5 name="user-tie" size={18} color="#2980b9" /> */}
                  <AntDesign name="tago" size={18} color="#2980b9" />
                </View>
                <View className="ml-3">
                  <Text className="text-xs text-gray-500">Trạng thái</Text>
                  <Text className="text-base font-semibold text-gray-700">
                    {visitInfo.visitStatus === "Active"
                      ? "Hoạt động"
                      : visitInfo.visitStatus === "ActiveTemporary"
                      ? "Tạm thời"
                      : "Không hoạt động"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={20}
                    color="#27ae60"
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-xs text-gray-500">Loại lịch</Text>
                  <Text className="text-base font-semibold  text-gray-700">
                    {visitInfo.scheduleTypeName === "ProcessWeek"
                      ? "Lịch theo tuần"
                      : visitInfo.scheduleTypeName === "ProcessMonth"
                      ? "Lịch theo tháng"
                      : visitInfo.scheduleTypeName === "ProcessYear"
                      ? "Lịch theo năm"
                      : "Lịch hàng ngày"}
                  </Text>
                </View>
              </View>

              {visitDetail.description && (
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center">
                    <MaterialCommunityIcons
                      name="note-text"
                      size={20}
                      color="#f1c40f"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-gray-500">Mô tả</Text>
                    {renderDescription(visitDetail.description)}
                  </View>
                </View>
              )}

              <Modal
                animationType="slide"
                transparent={true}
                visible={isDescriptionModalVisible}
                onRequestClose={() => setDescriptionModalVisible(false)}
              >
                <View className="flex-1 justify-center items-center bg-opacity-50">
                  <View className="bg-white w-[90%] rounded-xl p-6 max-h-[80%]">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-lg font-bold text-gray-700">
                        Mô tả chi tiết
                      </Text>
                      <TouchableOpacity
                        onPress={() => setDescriptionModalVisible(false)}
                      >
                        <MaterialCommunityIcons
                          name="close"
                          size={24}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                    <ScrollView>
                      <Text className="text-base text-gray-700">
                        {getPlainDescription(visitDetail.description || "")}
                      </Text>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </View>
          </View>

          <View className="bg-gray-50 rounded-3xl mb-4">
            <Text className="text-2xl font-semibold mb-6 text-[#34495e]">
              Thông tin khách
            </Text>

            {visitDetail && visitDetail.length > 0 ? (
              visitDetail.map((visit: VisitDetailType, index: number) => (
                <View key={index}>
                  <TouchableOpacity
                    onPress={() => toggleExpansion(index)}
                    className="bg-white rounded-2xl shadow-md mb-4"
                  >
                    <View className="p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-3">
                          <FontAwesome name="user" size={24} color="#1abc9c" />
                          <View>
                            <Text className="text-sm font-medium text-gray-800">
                              {visit.visitor?.visitorName}
                            </Text>
                            <Text className="text-xs text-gray-400">
                              {visit.expectedStartHour
                                ?.split(":")
                                .slice(0, 2)
                                .join(":")}{" "}
                              -{" "}
                              {visit.expectedEndHour
                                ?.split(":")
                                .slice(0, 2)
                                .join(":")}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor:
                                visit.sessionStatus === "CheckIn"
                                  ? "#abebc6"
                                  : visit.sessionStatus === "CheckOut"
                                  ? "#fadbd8"
                                  : "#e5e8e8",
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderRadius: 16,
                              marginBottom: 16,
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  visit.sessionStatus === "CheckIn"
                                    ? "#2ecc71"
                                    : visit.sessionStatus === "CheckOut"
                                    ? "#e74c3c"
                                    : "#85929e",
                                fontSize: 12,
                                fontWeight: "500",
                              }}
                            >
                              {visit.sessionStatus === "CheckIn"
                                ? "Đã vào"
                                : visit.sessionStatus === "CheckOut"
                                ? "Đã ra"
                                : "Chưa vào"}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center space-x-2">
                          <FontAwesome5
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#1abc9c"
                          />
                        </View>
                      </View>

                      {expandedItem === index && (
                        <View className="mt-4 space-y-3">
                          <View className="flex-row items-center space-x-3">
                            <FontAwesome5
                              name="building"
                              size={20}
                              color="#1abc9c"
                            />
                            <View>
                              <Text className="text-xs text-gray-500">
                                Công ty
                              </Text>
                              <Text className="text-sm font-medium text-gray-800">
                                {visit.visitor?.companyName || "N/A"}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center space-x-3">
                            <FontAwesome5
                              name="phone"
                              size={20}
                              color="#1abc9c"
                            />
                            <View>
                              <Text className="text-xs text-gray-500">
                                Số điện thoại
                              </Text>
                              <Text className="text-sm font-medium text-gray-800">
                                {visit.visitor?.phoneNumber || "N/A"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-lg text-gray-600 text-center italic">
                Không có thông tin chi tiết.
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default VisitDetail;
