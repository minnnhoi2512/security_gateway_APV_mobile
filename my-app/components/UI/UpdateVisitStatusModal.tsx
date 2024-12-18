// UpdateVisitStatusModal.tsx
import { useUpdateVisitStatusMutation } from "@/redux/services/visit.service";
import { Visit2 } from "@/redux/Types/visit.type";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface UpdateVisitStatusModalProps {
  visit: Visit2;
  isVisible: boolean;
  onClose: () => void;
}

export const UpdateVisitStatusModal: React.FC<UpdateVisitStatusModalProps> = ({
  visit,
  isVisible,
  onClose,
}) => {
  const [updateVisitStatus, { isLoading }] = useUpdateVisitStatusMutation();
  const router = useRouter();
  // const handleUpdateStatus = async (newStatus: "Active" | "Violation") => {
  //   try {
  //     await updateVisitStatus({
  //       visitId: visit.visitId,
  //       newStatus: newStatus,
  //     }).unwrap();
  //     onClose();
  //   } catch (error) {
  //     console.error("Cập nhật trạng thái chuyến thăm thất bại!:", error);
  //   }
  // };

  // const handleUpdateStatus = async (newStatus: "Active" | "Violation") => {
  //   try {
  //     await updateVisitStatus({
  //       visitId: visit.visitId,
  //       newStatus: newStatus,
  //     }).unwrap();
  //     onClose();

 
  //     if (newStatus === "Violation") {
  //       router.push("/(tabs)");
  //     }
  //   } catch (error) {
  //     console.error("Cập nhật trạng thái chuyến thăm thất bại!:", error);
  //   }
  // };


  const handleUpdateStatus = async (newStatus: "Active" | "Violation") => {
    try {
      await updateVisitStatus({
        visitId: visit.visitId,
        newStatus: newStatus,
      }).unwrap();
      
      onClose();
      if (newStatus === "Violation") {
        router.push("/(tabs)");
      }
    } catch (error) {
 
      onClose();
 
      Alert.alert(
        "Lỗi",
        "Cập nhật trạng thái chuyến thăm thất bại. Vui lòng thử lại sau.",
        [
          {
            text: "Đồng ý",
            // onPress: () => console.log("Alert closed")
          }
        ]
      );

      console.error("Cập nhật trạng thái chuyến thăm thất bại:", error);
    }
  };


  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      transparent={true}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center bg-transparent">
        <View className="absolute inset-0 bg-black/40" />
        <View className="bg-white/95 w-11/12 rounded-xl p-6 z-10 shadow-2xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">
              Cập nhật trạng thái lịch hẹn
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MaterialCommunityIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <Text className="text-base text-gray-700 mb-4">
            Bạn có chắc muốn cập nhật trạng thái của lịch hẹn này?
          </Text>

          {isLoading ? (
            <View className="h-20 items-center justify-center">
              <ActivityIndicator color="#10b981" size="large" />
            </View>
          ) : (
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => handleUpdateStatus("Violation")}
                className="bg-[#e67e22] px-6 py-2.5 rounded-lg border border-gray-200 flex-row items-center justify-center min-w-[90px]"
                disabled={isLoading}
              >
                <Text className="text-white font-medium">Báo cáo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleUpdateStatus("Active")}
                className="bg-buttonGreen px-6 py-2.5 rounded-lg shadow-sm flex-row items-center justify-center min-w-[90px]"
                disabled={isLoading}
              >
                <Text className="text-white font-medium">Cập nhật</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
