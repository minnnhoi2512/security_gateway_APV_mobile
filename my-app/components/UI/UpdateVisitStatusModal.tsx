// UpdateVisitStatusModal.tsx
import { useUpdateVisitStatusMutation } from "@/redux/services/visit.service";
import { Visit2 } from "@/redux/Types/visit.type";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  const handleUpdateStatus = async () => {
    try {
      await updateVisitStatus({
        visitId: visit.visitId,
        newStatus: "Active",
      }).unwrap(); // Using unwrap() to handle the Promise
      onClose();
    } catch (error) {
      console.error("Error updating visit status:", error);
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
          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity 
              onPress={onClose}
              className="bg-gray-100 px-6 py-2.5 rounded-lg border border-gray-200"
              disabled={isLoading}
            >
              <Text className="text-gray-700 font-medium">Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleUpdateStatus}
              className="bg-blue-600 px-6 py-2.5 rounded-lg shadow-sm"
              disabled={isLoading}
            >
              <Text className="text-white font-medium">
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};