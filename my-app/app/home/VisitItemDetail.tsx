import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Visit2 } from "@/redux/Types/visit.type";
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import RenderHTML from "react-native-render-html";
import { UpdateVisitStatusModal } from "@/components/UI/UpdateVisitStatusModal ";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface VisitCardProps {
  visit: Visit2;
}

const VisitItemDetail: React.FC<VisitCardProps> = ({ visit }) => {
  const { width } = useWindowDimensions();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      setRole(storedRole);
    };
    fetchRole();
  }, []);
  const handleUpdateStatus = () => {
    setIsUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
  };
  const [isDescriptionModalVisible, setDescriptionModalVisible] =
    useState(false);
  const getPlainDescription = (html: string) => {
    return html.replace(/<[^>]+>/g, "");
  };

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   await onRefreshVisit();
  //   setRefreshing(false);
  // };

  // console.log("vissit detail: ", visit);

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

  const renderTruncatedDescription = (
    description: string,
    maxLength: number = 100
  ) => {
    const plainText = description.replace(/<[^>]+>/g, "");

    if (plainText.length <= maxLength) {
      return (
        <RenderHTML
          contentWidth={width}
          source={{ html: description }}
          classesStyles={{
            "text-base": { color: "#4a4a4a" },
          }}
        />
      );
    }

    return (
      <View>
        <Text className="text-base text-gray-700">
          {plainText.slice(0, maxLength)}...{" "}
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

  return (
    <ScrollView
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
    >
      <View className="bg-white rounded-3xl shadow-lg p-6 mb-4">
        <View className="items-center mb-6">
          <View className="bg-teal-50 rounded-full px-6 py-2 mb-3">
            <Text className="text-2xl font-bold text-teal-600">
              {visit.visitName}
            </Text>
          </View>
          <View>
            {visit.visitStatus === "ActiveTemporary" && role === "Staff" && (
              <Button
                onPress={handleUpdateStatus}
                title="Cập nhật trạng thái"
              />
            )}
            <UpdateVisitStatusModal
              visit={visit}
              isVisible={isUpdateModalVisible}
              onClose={handleCloseUpdateModal}
            />
          </View>
          <View className="flex-row items-center space-x-2">
            <Text className="text-lg font-semibold text-gray-600">
              {visit.visitDetailStartTime?.split(":").slice(0, 2).join(":")}
            </Text>
            <Text className="text-lg font-semibold text-gray-400">-</Text>
            <Text className="text-lg font-semibold text-gray-600">
              {visit.visitDetailEndTime?.split(":").slice(0, 2).join(":")}
            </Text>
            <Text className="italic text-[#2ecc71]">(Dự kiến)</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="items-center bg-purple-50 rounded-xl px-4 py-2 flex-1 mx-1">
            <FontAwesome5 name="users" size={20} color="#9b59b6" />
            <Text className="text-xs text-gray-500 mt-1">Tổng số</Text>
            <Text className="text-lg font-bold text-purple-600">
              {visit.visitQuantity}
            </Text>
          </View>
          <View className="items-center bg-blue-50 rounded-xl px-4 py-2 flex-1 mx-1">
            <FontAwesome5 name="user-check" size={20} color="#2980b9" />
            <Text className="text-xs text-gray-500 mt-1">Đã vào</Text>
            <Text className="text-lg font-bold text-blue-600">
              {visit.visitorCheckkInCount}
            </Text>
          </View>
          <View className="items-center bg-red-50 rounded-xl px-4 py-2 flex-1 mx-1">
            <FontAwesome5 name="user-times" size={20} color="#e74c3c" />
            <Text className="text-xs text-gray-500 mt-1">Đã ra</Text>
            <Text className="text-lg font-bold text-red-600">
              {visit.visitorCheckOutedCount}
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
                {visit.createByname}
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
                {visit.visitStatus === "Active"
                  ? "Hoạt động"
                  : visit.visitStatus === "ActiveTemporary"
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
                {visit.scheduleTypeName === "ProcessWeek"
                  ? "Lịch theo tuần"
                  : visit.scheduleTypeName === "ProcessMonth"
                  ? "Lịch theo tháng"
                  : visit.scheduleTypeName === "ProcessYear"
                  ? "Lịch theo năm"
                  : "Lịch hàng ngày"}
              </Text>
            </View>
          </View>

          {visit.description && (
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
                {renderDescription(visit.description)}
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
                    {getPlainDescription(visit.description || "")}
                  </Text>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </ScrollView>
  );
};

export default VisitItemDetail;
