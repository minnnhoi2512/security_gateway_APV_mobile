import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  Modal,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Header from "@/components/UI/Header";

import { Visit2 } from "@/redux/Types/visit.type";
import VisitItem from "../home/VisitItem";
import { useGetAllVisitsByCurrentDateQuery } from "@/redux/services/visit.service";
import { useGetVisitorSessionDayQuery } from "@/redux/services/visitorSession.service";
interface SecurityInfo {
  fullName: string;
  phoneNumber: string;
  userId: number;
}

interface GateInfo {
  gateId: number;
  gateName: string;
}

interface VisitorSessionItem {
  visitorSessionId: number;
  checkinTime: string;
  checkoutTime: string | null;
  gateIn: GateInfo | null;
  gateOut: GateInfo | null;
  images: any | null;
  isVehicleSession: boolean;
  qrCardId: number;
  securityIn: SecurityInfo | null;
  securityOut: SecurityInfo | null;
  status: string;
  visitDetail: any | null;
}

interface HistoryModalProps {
  modalVisible2: boolean;
  setModalVisible2: (visible: boolean) => void;
  visitorSession: VisitorSessionItem[];
}
const Checkin: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const {
    data: visits,
    isLoading,
    isError,
    refetch,
  } = useGetAllVisitsByCurrentDateQuery(
    { pageSize: 10, pageNumber: 1 },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: visitorSession,
    isLoading: isLoadingVisitorSS,
    isError: isErrVisitorSS,
    refetch: refetchVSS,
  } = useGetVisitorSessionDayQuery({ pageSize: 10, pageNumber: 1 });

  // console.log("VISITOR SS NE CU: ", visitorSession);

  // const { error } = useLocalSearchParams<{
  //   error: string;
  // }>();
  // if (error) {
  //   Alert.alert("Lỗi trong quá trình quét mã", error,
  //     [
  //       {
  //         text: "Tạo mới",
  //         onPress: () => {
  //           router.push({
  //             pathname: "/(tabs)",
  //           });
  //         }
  //       }
  //     ]);
  // }

 


  const handleScanPress = async () => {
    if (permission?.granted) {
      router.push("/check-in/scanQr");
    } else {
      const { granted } = await requestPermission();
      if (granted) {
        router.push("/check-in/scanQr");
      } else {
        console.log("Quyền truy cập máy ảnh bị từ chối!");
      }
    }
  };

  const handleScanPress2 = async () => {
    if (permission?.granted) {
      router.push("/check-in/scanQr2");
    } else {
      const { granted } = await requestPermission();
      if (granted) {
        router.push("/check-in/scanQr2");
      } else {
        console.log("Quyền truy cập máy ảnh bị từ chối!");
      }
    }
  };

  const ScheduleModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-colorTitleHeader">
              Lịch hẹn
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={visits}
            renderItem={({ item }) => <VisitItem visit={item} />}
            // keyExtractor={(item) => item.visitId}
            // contentContainerClassName="p-4"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center p-8">
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={48}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 text-center mt-4">
                  Không có lịch hẹn nào
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // const SessionItem: React.FC<{ item: VisitorSessionItem }> = ({ item }) => {
  //   const handlePress = () => {
  //     router.push({
  //       pathname: "/visitSessionDetail",
  //       params: { 
  //         sessionId: item.visitorSessionId,
  //         sessionData: JSON.stringify(item)
  //       }
  //     });
  //   };
  //   <View className="flex-row mb-4">
  //     {/* Timeline dot and line */}
  //     <View className="items-center mr-4 w-6">
  //       <View
  //         className={`w-4 h-4 rounded-full border-2 border-white ${
  //           item.status === "CheckIn" ? "bg-green-500" : "bg-red-500"
  //         }`}
  //       />
  //       <View className="w-0.5 h-full bg-gray-200 absolute top-4" />
  //     </View>

  //     {/* Content card */}
  //     <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
  //       {/* Header with status and time */}
  //       <View className="flex-row justify-between items-start mb-3">
  //         <View>
  //           <View className="flex-row items-center">
  //             {item.status === "CheckIn" ? (
  //               <MaterialCommunityIcons
  //                 name="login"
  //                 size={16}
  //                 color="#22C55E"
  //               />
  //             ) : (
  //               <MaterialCommunityIcons
  //                 name="logout"
  //                 size={16}
  //                 color="#EF4444"
  //               />
  //             )}
  //             <Text className="text-gray-800 font-semibold ml-2">
  //               {item.status === "CheckIn" ? "Đã vào" : "Đã ra"}
  //             </Text>
  //           </View>
  //           {/* <Text className="text-gray-500 text-xs mt-1">
  //             {formatDateLocal(
  //               item.status === "CheckIn"
  //                 ? item.checkinTime
  //                 : item.checkoutTime || ""
  //             )}
  //           </Text> */}
  //         </View>
  //         {item.isVehicleSession && (
  //           <View className="bg-blue-50 px-3 py-1 rounded-full flex-row items-center">
  //             <MaterialCommunityIcons name="car" size={14} color="#3B82F6" />
  //             <Text className="text-blue-500 text-xs ml-1">Có phương tiện</Text>
  //           </View>
  //         )}
  //       </View>

  //       {/* Gate and Security info */}
  //       <View className="border-t border-gray-100 pt-3">
  //         <View className="flex-row justify-between mb-2">
  //           <View className="flex-1">
  //             <Text className="text-xs text-gray-500 mb-1">Cổng</Text>
  //             <Text className="text-sm font-medium text-gray-800">
  //               {item.status === "CheckIn"
  //                 ? item.gateIn?.gateName
  //                 : item.gateOut?.gateName}
  //             </Text>
  //           </View>
  //           <View className="flex-1">
  //             <Text className="text-xs text-gray-500 mb-1">Bảo vệ</Text>
  //             <View className="flex-row items-center">
  //               <MaterialCommunityIcons
  //                 name="shield-account"
  //                 size={14}
  //                 color="#9CA3AF"
  //                 style={{ marginRight: 4 }}
  //               />
  //               <Text className="text-sm font-medium text-gray-800">
  //                 {item.status === "CheckIn"
  //                   ? item.securityIn?.fullName
  //                   : item.securityOut?.fullName}
  //               </Text>
  //             </View>
  //           </View>
  //         </View>
  //       </View>
  //     </View>
  //   </View>
  // };
  const SessionItem: React.FC<{ item: VisitorSessionItem,onClose: () => void;  }> = ({ item, onClose }) => {
    const router = useRouter();
    
    const handlePress = () => {
      onClose(); 
      router.push({
        pathname: "/visitSessionDetail",
        params: { 
          sessionId: item.visitorSessionId,
          sessionData: JSON.stringify(item)
        }
      });
    };
  
    return (
      <TouchableOpacity onPress={handlePress}>
        <View className="flex-row mb-4">
          {/* Timeline dot and line */}
          <View className="items-center mr-4 w-6">
            <View
              className={`w-4 h-4 rounded-full border-2 border-white ${
                item.status === "CheckIn" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <View className="w-0.5 h-full bg-gray-200 absolute top-4" />
          </View>
  
          {/* Content card */}
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            {/* Header with status and time */}
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <View className="flex-row items-center">
                  {item.status === "CheckIn" ? (
                    <MaterialCommunityIcons
                      name="login"
                      size={16}
                      color="#22C55E"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="logout"
                      size={16}
                      color="#EF4444"
                    />
                  )}
                  <Text className="text-gray-800 font-semibold ml-2">
                    {item.status === "CheckIn" ? "Đã vào" : "Đã ra"}
                  </Text>
                </View>
              </View>
              {item.isVehicleSession && (
                <View className="bg-blue-50 px-3 py-1 rounded-full flex-row items-center">
                  <MaterialCommunityIcons name="car" size={14} color="#3B82F6" />
                  <Text className="text-blue-500 text-xs ml-1">Có phương tiện</Text>
                </View>
              )}
            </View>
  
            {/* Gate and Security info */}
            <View className="border-t border-gray-100 pt-3">
              <View className="flex-row justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Cổng</Text>
                  <Text className="text-sm font-medium text-gray-800">
                    {item.status === "CheckIn"
                      ? item.gateIn?.gateName
                      : item.gateOut?.gateName}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Bảo vệ</Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="shield-account"
                      size={14}
                      color="#9CA3AF"
                      style={{ marginRight: 4 }}
                    />
                    <Text className="text-sm font-medium text-gray-800">
                      {item.status === "CheckIn"
                        ? item.securityIn?.fullName
                        : item.securityOut?.fullName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const VisitorHistoryModal: React.FC<HistoryModalProps> = ({
    modalVisible2,
    setModalVisible2,
    visitorSession,
  }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible2}
      onRequestClose={() => setModalVisible2(false)}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-gray-50 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100 bg-white rounded-t-3xl">
            <Text className="text-xl font-bold text-gray-800">
              Lịch sử ra vào
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible2(false)}
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Timeline list */}
          <FlatList
            data={visitorSession}
            renderItem={({ item }) => <SessionItem item={item} onClose={() => setModalVisible2(false)} />}
            keyExtractor={(item) => item.visitorSessionId.toString()}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center p-8">
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={48}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 text-center mt-4">
                  Không có lịch sử ra - vào
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <Header name="Đặng Dương" />

        <View className="flex-1 px-4 pt-6 mt-8">
          {/* <View className="mb-6">
            <Text className="text-3xl font-bold text-colorTitleHeader">
              Chào ngày mới! 👋
            </Text>
            <Text className="text-gray-500 mt-2">
              Hãy bắt đầu ngày mới với năng lượng tích cực
            </Text>
          </View> */}

          {/* <TouchableOpacity  onPress={handleScanPress2}><Text>Here</Text></TouchableOpacity> */}

          <View className="items-center mb-4">
            <TouchableOpacity
              onPress={handleScanPress}
              className="bg-backgroundApp rounded-3xl w-72 h-72 shadow-xl"
            >
              <View className="flex-1 items-center justify-center">
                <View className="bg-white/10 rounded-2xl p-6 mb-4">
                  <Ionicons name="qr-code" size={90} color="white" />
                </View>
                <Text className="text-white font-bold text-2xl">Quét QR</Text>
                <View className="flex-row items-center mt-3">
                  <Feather name="camera" size={16} color="white" />
                  <Text className="text-white/90 text-sm ml-2">
                    Nhấn để quét mã
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Actions - Modern Cards */}
          <Text className="text-lg font-semibold text-gray-800 mb-4 px-2">
            Truy cập nhanh
          </Text>
          <View className="flex-row justify-between px-2">
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 shadow-sm flex-1 mr-4"
              onPress={() => setModalVisible2(true)}
            >
              <View className="w-12 h-12 rounded-xl bg-purple-50 items-center justify-center mb-3">
                <MaterialCommunityIcons
                  name="history"
                  size={24}
                  color="#7C3AED"
                />
              </View>
              <Text className="text-gray-800 font-medium">Lịch sử</Text>
              <Text className="text-gray-500 text-xs mt-1">
                Xem các lần check-in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-2xl p-4 shadow-sm flex-1"
              onPress={() => setModalVisible(true)}
            >
              <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center mb-3">
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={24}
                  color="#EA580C"
                />
              </View>
              <Text className="text-gray-800 font-medium">Lịch làm việc</Text>
              <Text className="text-gray-500 text-xs mt-1">
                Xem ca làm việc
              </Text>
            </TouchableOpacity>
          </View>
          <VisitorHistoryModal
            modalVisible2={modalVisible2}
            setModalVisible2={setModalVisible2}
            visitorSession={visitorSession || []}
          />
          <ScheduleModal />
        </View>
      </View>
    </SafeAreaProvider>
  );
};

export default Checkin;
