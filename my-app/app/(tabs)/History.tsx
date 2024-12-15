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
  MaterialIcons,
} from "@expo/vector-icons";
import {
  useGetVisitorSessionsQuery,
  VisitorSession,
} from "@/redux/services/visitorSession.service";
import { Image } from "react-native";
import {
  Building,
  Clock,
  ImageIcon,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react-native";

interface DetailModalProps {
  selectedSession: VisitorSession | null;
  setSelectedSession: (session: VisitorSession | null) => void;
}

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

  // const StatusBadge = ({ status }: { status: string }) => {
  //   const getStatusStyle = () => {
  //     switch (status) {
  //       case "CheckIn":
  //         return "bg-emerald-500";
  //       case "CheckOut":
  //         return "bg-amber-500";
  //       default:
  //         return "bg-gray-400";
  //     }
  //   };

  //   return (
  //     <View
  //       className={`px-3 py-1.5 rounded-full flex-row items-center ${getStatusStyle()}`}
  //     >
  //       <View className="w-2 h-2 rounded-full bg-white/90 mr-2 animate-pulse" />
  //       <Text className="text-white text-xs font-bold">
  //         {status === "CheckIn"
  //           ? "Đã vào"
  //           : status === "CheckOut"
  //           ? "Đã ra"
  //           : status}
  //       </Text>
  //     </View>
  //   );
  // };

  // const SessionCard = ({ item }: { item: VisitorSession }) => (
  //   <Pressable onPress={() => setSelectedSession(item)} className="mb-4 mx-4">
  //     <View className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
  //       <View className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50">
  //         <View className="flex-row items-center justify-between">
  //           <View className="flex-row items-center">
  //             <View className="w-14 h-14 bg-[#d4efdf] rounded-2xl items-center justify-center shadow-sm">
  //               <FontAwesome6 name="calendar-day" size={24} color="#1abc9c" />
  //             </View>
  //             <View className="ml-4">
  //               <Text className="text-[#1abc9c] font-bold text-lg">
  //                 {/* Chuyến thăm #{item.visitorSessionId} */}

  //                 {item.visitDetail.visitor.visitorName}
  //               </Text>
  //               <View className="flex-row items-center mt-1">
  //                 <MaterialCommunityIcons
  //                   name="calendar-clock"
  //                   size={16}
  //                   color="#6B7280"
  //                 />
  //                 <Text className="text-gray-600 text-xs ml-1.5 font-medium">
  //                   {formatTime(item.checkinTime)} -{" "}
  //                   {formatTime(item.checkoutTime)}
  //                 </Text>
  //               </View>
  //             </View>
  //           </View>
  //           <StatusBadge status={item.status} />
  //         </View>
  //       </View>
  //     </View>
  //   </Pressable>
  // );

  // const DetailModal = () => {
  //   if (!selectedSession) return null;

  //   return (
  //     <Modal
  //     animationType="slide"
  //     transparent={true}
  //     visible={!!selectedSession}
  //     onRequestClose={() => setSelectedSession(null)}
  //   >
  //     <View className="flex-1 bg-black/50 justify-end">
  //       <View className="bg-white rounded-t-3xl max-h-[90%] shadow-xl">

  //         <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
  //           <View className="flex-row items-center">
  //             <ShieldCheck color="#1abc9c" size={24} />
  //             <Text className="text-lg font-bold text-[#1abc9c] ml-2">
  //               {selectedSession.visitDetail.visitor.visitorName}
  //             </Text>
  //           </View>
  //           <Pressable
  //               onPress={() => setSelectedSession(null)}
  //             className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
  //           >
  //             <X color="#4B5563" size={20} />
  //           </Pressable>
  //         </View>

  //         <ScrollView className="px-4 py-3">

  //           <View className="bg-emerald-50 rounded-xl p-4 mb-3">
  //             <View className="flex-row items-center mb-3">
  //               <User color="#059669" size={20} />
  //               <Text className="text-emerald-800 font-bold text-base ml-2">
  //                 Thông tin khách
  //               </Text>
  //             </View>
  //             <InfoRow
  //               icon={<User color="#059669" size={18} />}
  //               label="Họ tên"
  //               value={selectedSession.visitDetail.visitor.visitorName}
  //             />
  //             <InfoRow
  //               icon={<Building color="#059669" size={18} />}
  //               label="Công ty"
  //               value={selectedSession.visitDetail.visitor.companyName}
  //             />
  //             <InfoRow
  //               icon={<Phone color="#059669" size={18} />}
  //               label="Điện thoại"
  //               value={selectedSession.visitDetail.visitor.phoneNumber}
  //             />
  //           </View>

  //           <View className="bg-blue-50 rounded-xl p-4 mb-3">
  //             <View className="flex-row items-center mb-3">
  //               <ShieldCheck color="#1d4ed8" size={20} />
  //               <Text className="text-blue-800 font-bold text-base ml-2">
  //                 Thông tin bảo vệ
  //               </Text>
  //             </View>
  //             <View className="flex-row justify-between">
  //               <View className="flex-1 bg-white rounded-lg p-3 mr-2">
  //                 <View className="flex-row items-center mb-2">
  //                   {/* <Enter color="#2563eb" size={18} /> */}
  //                   <MaterialIcons name="security" size={18} color="#2563eb" />
  //                   <Text className="text-blue-600 font-medium ml-2">
  //                     Bảo vệ vào
  //                   </Text>
  //                 </View>
  //                 <Text className="text-gray-700">
  //                   {selectedSession.securityIn.fullName}
  //                 </Text>
  //                 <Text className="text-gray-500 text-sm">
  //                   {selectedSession.securityIn.phoneNumber}
  //                 </Text>
  //               </View>
  //               <View className="flex-1 bg-white rounded-lg p-3">
  //                 <View className="flex-row items-center mb-2">
  //                 <MaterialIcons name="security" size={18} color="#2563eb" />
  //                   <Text className="text-blue-600 font-medium ml-2">
  //                     Bảo vệ ra
  //                   </Text>
  //                 </View>
  //                 <Text className="text-gray-700">
  //                   {selectedSession.securityOut.fullName}
  //                 </Text>
  //                 <Text className="text-gray-500 text-sm">
  //                   {selectedSession.securityOut.phoneNumber}
  //                 </Text>
  //               </View>
  //             </View>
  //           </View>

  //           <View className="bg-amber-50 rounded-xl p-4 mb-3">
  //             <View className="flex-row items-center mb-3">

  //               <MaterialCommunityIcons name="gate" size={20} color="#b45309" />
  //               <Text className="text-amber-800 font-bold text-base ml-2">
  //                 Thông tin cổng
  //               </Text>
  //             </View>
  //             <View className="flex-row justify-between">
  //               <View className="flex-1 bg-white rounded-lg p-3 mr-2">
  //                 <View className="flex-row items-center mb-2">

  //                   <FontAwesome5 name="sign-in-alt" size={18} color="#4CAF50" />
  //                   <Text className="text-[#4CAF50] ml-2">Vào</Text>
  //                 </View>
  //                 <View className="flex-row items-center">
  //                   <Text className="text-gray-700">
  //                     {selectedSession.gateIn.gateName}
  //                   </Text>
  //                 </View>
  //                 <View className="flex-row items-center mt-1">
  //                   <Clock color="#4B5563" size={16} />
  //                   <Text className="ml-2 text-gray-500 text-sm">
  //                     {formatTime(selectedSession.checkinTime)}
  //                   </Text>
  //                 </View>
  //               </View>
  //               <View className="flex-1 bg-white rounded-lg p-3">
  //                 <View className="flex-row items-center mb-2">

  //                   <FontAwesome5 name="sign-out-alt" size={14} color="#F44336" />
  //                   <Text className="text-[#F44336] ml-2">Ra</Text>
  //                 </View>
  //                 <View className="flex-row items-center">
  //                   <Text className="text-gray-700">
  //                     {selectedSession.gateOut.gateName}
  //                   </Text>
  //                 </View>
  //                 <View className="flex-row items-center mt-1">
  //                   <Clock color="#4B5563" size={16} />
  //                   <Text className="ml-2 text-gray-500 text-sm">
  //                     {formatTime(selectedSession.checkoutTime)}
  //                   </Text>
  //                 </View>
  //               </View>
  //             </View>
  //           </View>

  //           {selectedSession.images.length > 0 && (
  //             <View className="bg-purple-50 rounded-xl p-4">
  //               <View className="flex-row items-center mb-3">
  //                 <ImageIcon color="#7e22ce" size={20} />
  //                 <Text className="text-purple-800 font-bold text-base ml-2">
  //                   Hình ảnh check in
  //                 </Text>
  //               </View>
  //               <View className="flex-row flex-wrap -mx-1">
  //                 {selectedSession.images.map((image) => (
  //                   <Image
  //                     key={image.visitorSessionsImageId}
  //                     source={{ uri: image.imageURL }}
  //                     className="w-24 h-24 rounded-lg m-1"
  //                   />
  //                 ))}
  //               </View>
  //             </View>
  //           )}
  //         </ScrollView>
  //       </View>
  //     </View>
  //   </Modal>
  //   );
  // };
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
        className={`px-2 py-1 rounded-full flex-row items-center ${getStatusStyle()}`}
      >
        <View className="w-1.5 h-1.5 rounded-full bg-white/90 mr-1.5 animate-pulse" />
        <Text className="text-white text-[10px] font-bold">
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
        <View className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 relative">
          <View className="absolute top-2 right-3">
            <StatusBadge status={item.status} />
          </View>
          <View className="flex-row items-center pr-16">
            <View className="w-14 h-14 bg-[#d4efdf] rounded-2xl items-center justify-center shadow-sm">
              <FontAwesome6 name="calendar-day" size={24} color="#1abc9c" />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[#1abc9c] font-bold text-lg"
                numberOfLines={1}
              >
                {item.visitDetail.visitor.visitorName}
              </Text>
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={16}
                  color="#6B7280"
                />
                <Text className="text-gray-600 text-xs ml-1.5 font-medium">
                  {formatTime(item.checkinTime)} <Text> - </Text>{" "}
                  {formatTime(item.checkoutTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
  const DetailModal: React.FC<DetailModalProps> = ({
    selectedSession,
    setSelectedSession,
  }) => {
    if (!selectedSession) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedSession}
        onRequestClose={() => setSelectedSession(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%] shadow-xl">
            {/* Header */}
            <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <ShieldCheck color="#1abc9c" size={24} />
                <Text className="text-lg font-bold text-[#1abc9c] ml-2">
                  {selectedSession.visitDetail?.visitor.visitorName}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedSession(null)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X color="#4B5563" size={20} />
              </Pressable>
            </View>

            <ScrollView className="px-4 py-3">
              {/* Visitor Info */}
              <View className="bg-emerald-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <User color="#059669" size={20} />
                  <Text className="text-emerald-800 font-bold text-base ml-2">
                    Thông tin khách
                  </Text>
                </View>
                <InfoRow
                  icon={<User color="#059669" size={18} />}
                  label="Họ tên"
                  value={
                    selectedSession.visitDetail?.visitor.visitorName || "N/A"
                  }
                />
                <InfoRow
                  icon={<Building color="#059669" size={18} />}
                  label="Công ty"
                  value={
                    selectedSession.visitDetail?.visitor.companyName || "N/A"
                  }
                />
                <InfoRow
                  icon={<Phone color="#059669" size={18} />}
                  label="Điện thoại"
                  value={
                    selectedSession.visitDetail?.visitor.phoneNumber || "N/A"
                  }
                />
              </View>

              {/* Security Info */}
              <View className="bg-blue-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <ShieldCheck color="#1d4ed8" size={20} />
                  <Text className="text-blue-800 font-bold text-base ml-2">
                    Thông tin bảo vệ
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <View className="flex-1 bg-white rounded-lg p-3 mr-2">
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons
                        name="security"
                        size={18}
                        color="#2563eb"
                      />
                      <Text className="text-blue-600 font-medium ml-2">
                        Bảo vệ vào
                      </Text>
                    </View>
                    {selectedSession.securityIn ? (
                      <>
                        <Text className="text-gray-700">
                          {selectedSession.securityIn.fullName}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {selectedSession.securityIn.phoneNumber}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-gray-500">Không có thông tin</Text>
                    )}
                  </View>
                  <View className="flex-1 bg-white rounded-lg p-3">
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons
                        name="security"
                        size={18}
                        color="#2563eb"
                      />
                      <Text className="text-blue-600 font-medium ml-2">
                        Bảo vệ ra
                      </Text>
                    </View>
                    {selectedSession.securityOut ? (
                      <>
                        <Text className="text-gray-700">
                          {selectedSession.securityOut.fullName}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {selectedSession.securityOut.phoneNumber}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-gray-500">Không có thông tin</Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Gate Info */}
              <View className="bg-amber-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons
                    name="gate"
                    size={20}
                    color="#b45309"
                  />
                  <Text className="text-amber-800 font-bold text-base ml-2">
                    Thông tin cổng
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <View className="flex-1 bg-white rounded-lg p-3 mr-2">
                    <View className="flex-row items-center mb-2">
                      <FontAwesome5
                        name="sign-in-alt"
                        size={18}
                        color="#4CAF50"
                      />
                      <Text className="text-[#4CAF50] ml-2">Vào</Text>
                    </View>
                    {selectedSession.gateIn ? (
                      <>
                        <View className="flex-row items-center">
                          <Text className="text-gray-700">
                            {selectedSession.gateIn.gateName}
                          </Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <Clock color="#4B5563" size={16} />
                          <Text className="ml-2 text-gray-500 text-sm">
                            {formatTime(selectedSession.checkinTime)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text className="text-gray-500">Không có thông tin</Text>
                    )}
                  </View>
                  <View className="flex-1 bg-white rounded-lg p-3">
                    <View className="flex-row items-center mb-2">
                      <FontAwesome5
                        name="sign-out-alt"
                        size={14}
                        color="#F44336"
                      />
                      <Text className="text-[#F44336] ml-2">Ra</Text>
                    </View>
                    {selectedSession.gateOut ? (
                      <>
                        <View className="flex-row items-center">
                          <Text className="text-gray-700">
                            {selectedSession.gateOut.gateName}
                          </Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <Clock color="#4B5563" size={16} />
                          <Text className="ml-2 text-gray-500 text-sm">
                            {formatTime(selectedSession.checkoutTime)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text className="text-gray-500">Không có thông tin</Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Images */}
              {selectedSession.images && selectedSession.images.length > 0 && (
                <View className="bg-purple-50 rounded-xl p-4">
                  <View className="flex-row items-center mb-3">
                    <ImageIcon color="#7e22ce" size={20} />
                    <Text className="text-purple-800 font-bold text-base ml-2">
                      Hình ảnh check in
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap -mx-1">
                    {selectedSession.images.map((image) => (
                      <Image
                        key={image.visitorSessionsImageId}
                        source={{ uri: image.imageURL }}
                        className="w-24 h-24 rounded-lg m-1"
                      />
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
      <DetailModal
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
      />
    </SafeAreaView>
  );
};

export default History;
