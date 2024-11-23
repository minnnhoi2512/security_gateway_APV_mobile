import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCheckOutWithCardMutation,
  useCheckOutWithCredentialCardMutation,
  useGetVisitorImageByVisitorSessionIdQuery,
  useGetVissitorSessionQuery,
} from "@/redux/services/checkout.service";
import { useSelector } from "react-redux";
import { EvilIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";

import Header from "@/components/UI/Header";
import { RootState } from "@/redux/store/store";
import { useGetVisitorByIdQuery } from "@/redux/services/visitor.service";
import { useToast } from "@/components/Toast/ToastContext";

const CheckoutCard = () => {
  const { data, qrCardVerifiedProps } = useLocalSearchParams();
  const visitData = data ? JSON.parse(data.toString()) : null;
  // console.log("visitData: ", JSON.stringify(visitData, null, 2));
  // console.log("qrCardVerifiedProps: ", qrCardVerifiedProps);
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  //Query
  const [checkOutWithCard, { isLoading: isloadingWithCard }] =
    useCheckOutWithCardMutation();
  const [
    checkOutWithCredentialCard,
    { isLoading: isLoadingWithCredentialcard },
  ] = useCheckOutWithCredentialCardMutation();
  const {
    data: dataVisitorSessionImage,
    error: errorVisitorSessionImage,
    refetch,
    isFetching: isFetchingVisitorSessionImage,
    isLoading: isLoadingVisitorSessionImage,
  } = useGetVisitorImageByVisitorSessionIdQuery(visitData.visitorSessionId, {});
  const {
    data: dataVisitor,
    error: errorVisitor,
    refetch: refetchVisitor,
    isFetching: isFetchingVisitor,
    isLoading: isLoadingVisitor,
  } = useGetVisitorByIdQuery(visitData.visitDetail.visitorId, {});
  // console.log(dataVisitor);
  const [refreshing, setRefreshing] = useState(false);
  const [checkOutData, setCheckOutData] = useState({
    securityOutId: 0,
    gateOutId: Number(selectedGateId) || 0,
  });
  const { showToast } = useToast();

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  useEffect(() => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    }
  }, [permission]);
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setIsPermissionGranted(status === "granted");
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          // console.log("User ID from AsyncStorage:", storedUserId);
        } else {
          console.log("No userId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      setCheckOutData((prevState) => ({
        ...prevState,
        securityOutId: Number(userId) || 0,
      }));
    }
  }, [userId, selectedGateId]);

  // const handleCheckout1 = useCallback(() => {

  //   onPress: async () => {
  //     try {
  //       const response = await checkOut({
  //         qrCardVerifi: qrCardVerifiedProps,
  //         checkoutData: checkOutData,
  //       }).unwrap();
  //       Alert.alert("Thành công", "Checkout thành công!");

  //       setCheckOutData({
  //         securityOutId: 0,
  //         gateOutId: Number(selectedGateId) || 0,
  //       });
  //       //refetch();
  //       //console.log("QR VER: ", qrCardVerified);

  //       //setIsCameraActive(false);

  //       // Remove session data from AsyncStorage
  //       await AsyncStorage.removeItem("visitorSession");

  //       // Navigate back to the main screen
  //       router.push("/(tabs)/");
  //     } catch (error) {
  //       console.error("Checkout error:", error);
  //       Alert.alert("Lỗi", "Checkout thất bại.");
  //     }

  //     // console.log("QR VER2: ", qrCardVerified);
  //   }
  // }, [checkOut, checkOutData, selectedGateId, router]);

  const handleCheckout = async () => {
    try {
      if (qrCardVerifiedProps === null || qrCardVerifiedProps === undefined) {
        const response = await checkOutWithCredentialCard({
          credentialCard: dataVisitor?.credentialsCard,
          checkoutData: checkOutData,
        }).unwrap();
      } else {
        const response = await checkOutWithCard({
          qrCardVerifi: qrCardVerifiedProps,
          checkoutData: checkOutData,
        }).unwrap();
      }
      // Alert.alert("Thành công", "Checkout thành công!");
      showToast("Bạn vừa check out thành công!", "success");
      router.push("/(tabs)/checkout");
    } catch (error) {
      // console.error("Checkout error:", error);
      showToast("Đã có lỗi xảy ra", "error");
      Alert.alert("Lỗi", "Checkout thất bại.");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // const onRefresh = useCallback(async () => {
  //   setRefreshing(true);
  //   if (qrCardVerified) {
  //     await refetch();
  //   }
  //   setRefreshing(false);
  // }, [qrCardVerified, refetch]);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View className="flex-row justify-between py-2">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-black text-sm font-medium">{value}</Text>
    </View>
  );

  const Section = ({
    children,
    icon,
    title,
  }: {
    children: React.ReactNode;
    icon?: React.ReactNode;
    title: string;
  }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-lg font-semibold text-black">{title}</Text>
      </View>
      {children}
    </View>
  );

  const SectionDropDown = ({
    children,
    icon,
    title,
  }: {
    children: React.ReactNode;
    icon?: React.ReactNode;
    title: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View className="bg-white rounded-2xl mb-4 shadow-sm">
        <TouchableOpacity
          onPress={() => setIsOpen((prev) => !prev)}
          className="p-4 flex-row items-center"
        >
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            {icon}
          </View>
          <Text className="text-lg font-semibold text-black">{title}</Text>
        </TouchableOpacity>
        {isOpen && <View className="p-4">{children}</View>}
      </View>
    );
  };
  if (!isPermissionGranted) {
    return (
      <View>
        <Text>Permission not granted</Text>
        <Button title="Request permission" onPress={requestPermission}></Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-backgroundApp">
      <View className=" bg-backgroundApp">
        <Pressable
          onPress={handleGoBack}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-backgroundApp rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
          <Text className="text-white font-medium">Quay về</Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1 mt-[5%]">
        <View className="p-4">
          <Section title="Thông tin checkin của khách">
            {/* <InfoRow label="Mã chi tiết thăm" value={data.visitDetailId} /> */}
            <InfoRow
              label="Thời gian vào"
              value={formatDate(visitData.checkinTime)}
            />
            <InfoRow label="Cổng vào" value={visitData.gateIn.gateName} />
            <InfoRow label="Bảo vệ" value={visitData.securityIn.fullName} />
          </Section>

          <SectionDropDown
            title="Thông tin thẻ"
            icon={<View className="w-6 h-6 bg-green-500 rounded-full" />}
          >
            <InfoRow
              label="Ngày cấp"
              value={visitData.visitCard.issueDate.split("T")[0]}
            />
            <InfoRow
              label="Ngày hết hạn"
              value={visitData.visitCard.expiryDate.split("T")[0]}
            />
            {/* <InfoRow
            label="Trạng thái thẻ"
            value={visitData.visitCard.card.cardStatus}
          /> */}
            <InfoRow
              label="Trạng thái"
              value={
                visitData.visitCard.card.cardStatus === "Active"
                  ? "Hoạt động"
                  : "Không hoạt động"
              }
            />
            <InfoRow
              label="Ngày hết hạn"
              value={visitData.visitCard.expiryDate.split("T")[0]}
            />
            <Image
              source={{
                uri: `data:image/png;base64,${visitData.visitCard.card.cardImage}`,
              }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 10,
                marginVertical: 10,
              }}
              resizeMode="contain"
            />
          </SectionDropDown>

          <SectionDropDown
            title="Thông tin chi tiết chuyến thăm"
            icon={<View className="w-6 h-6 bg-purple-500 rounded-full" />}
          >
            <InfoRow
              label="Giờ dự kiến vào"
              value={visitData.visitDetail.expectedStartHour}
            />
            <InfoRow
              label="Giờ dự kiến ra"
              value={visitData.visitDetail.expectedEndHour}
            />
          </SectionDropDown>

          <SectionDropDown
            title="Thông tin chi tiết khách"
            icon={<View className="w-6 h-6 bg-blue-500 rounded-full" />}
          >
            <InfoRow label="Tên đầy đủ" value={dataVisitor?.visitorName} />
            <Image
              source={{
                uri: `data:image/png;base64,${dataVisitor?.visitorCredentialImage}`,
              }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 10,
                marginVertical: 10,
              }}
              resizeMode="contain"
            />
          </SectionDropDown>
          <SectionDropDown
            title="Hình ảnh giày"
            icon={<View className="w-6 h-6 bg-yellow-500 rounded-full" />}
          >
            {dataVisitorSessionImage &&
              dataVisitorSessionImage.map(
                (
                  image: { imageURL: string; imageType: string },
                  index: number
                ) => (
                  <View key={index}>
                    <Image
                      source={{ uri: image.imageURL }}
                      style={{
                        width: "100%",
                        height: 200,
                        borderRadius: 10,
                        marginVertical: 10,
                      }}
                      resizeMode="contain"
                    />
                    {/* <Text className="text-xl">
                      {image.imageType === "Shoe" ? "Giày" : "Ảnh khách hàng"}
                    </Text> */}
                  </View>
                )
              )}
          </SectionDropDown>
          <TouchableOpacity
            onPress={handleCheckout}
            className="p-4 mb-4 bg-white rounded-full flex-row items-center justify-center"
          >
            <Text className="text-lg mr-2">Xác nhận Checkout</Text>
            <EvilIcons name="arrow-right" size={30} color="black" />
          </TouchableOpacity>
          {/* <View style={styles.content}>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              refreshing && styles.checkoutButtonDisabled,
            ]}
            onPress={handleCheckout}
            disabled={refreshing}
          >
            <View style={styles.buttonContent}>
              {refreshing && (
                <ActivityIndicator color="white" style={styles.buttonLoader} />
              )}
              <Text style={styles.buttonText}>Xác nhận Checkout</Text>
            </View>
          </TouchableOpacity>
        </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckoutCard;

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: "#f5f5f5",
  // },
  // scrollView: {
  //   flex: 1,
  // },
  // header: {
  //   padding: 16,
  //   backgroundColor: "white",
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#e5e5e5",
  // },
  // headerTitle: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: "#1f2937",
  // },
  // content: {
  //   padding: 16,
  // },
  // section: {
  //   marginBottom: 24,
  //   backgroundColor: "white",
  //   borderRadius: 12,
  //   padding: 16,
  //   shadowColor: "#000",
  //   shadowOffset: {
  //     width: 0,
  //     height: 2,
  //   },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 3,
  //   elevation: 3,
  // },
  // sectionTitle: {
  //   fontSize: 20,
  //   fontWeight: "600",
  //   color: "#1f2937",
  //   marginBottom: 16,
  // },
  // infoRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   paddingVertical: 12,
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#e5e5e5",
  // },
  // label: {
  //   fontSize: 16,
  //   color: "#4b5563",
  //   flex: 1,
  // },
  // value: {
  //   fontSize: 16,
  //   color: "#1f2937",
  //   flex: 1,
  //   textAlign: "right",
  // },
  imagesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  imageContainer: {
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  imageLabel: {
    marginTop: 8,
    // fontSize: 14,
    color: "#6b7280",
  },
  // statusBadge: {
  //   backgroundColor: "#dcfce7",
  //   paddingHorizontal: 12,
  //   paddingVertical: 6,
  //   borderRadius: 16,
  // },
  // statusText: {
  //   color: "#166534",
  //   fontSize: 14,
  //   fontWeight: "500",
  // },
  // cardImage: {
  //   width: 96,
  //   height: 96,
  //   borderRadius: 8,
  //   backgroundColor: "#f3f4f6",
  // },
  // checkoutButton: {
  //   backgroundColor: "#22c55e",
  //   borderRadius: 8,
  //   padding: 16,
  //   marginTop: 24,
  // },
  // checkoutButtonDisabled: {
  //   opacity: 0.5,
  // },
  // buttonContent: {
  //   flexDirection: "row",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // buttonLoader: {
  //   marginRight: 8,
  // },
  // buttonText: {
  //   color: "white",
  //   fontSize: 16,
  //   fontWeight: "600",
  //   textAlign: "center",
  // },
});
