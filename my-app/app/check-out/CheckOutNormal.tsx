import {
  View,
  Text,
  Alert,
  SafeAreaView,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import { CheckOut, CheckOutVerWithLP } from "@/Types/checkout.type";
import { RootState } from "@/redux/store/store";
import {
  EvilIcons,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useCheckOutWithCardMutation,
  useCheckOutWithCredentialCardMutation,
} from "@/redux/services/checkout.service";
import { uploadToFirebase } from "@/firebase-config";

interface CheckoutResponse {
  checkinTime: string;
  gateIn: any;
  securityIn: any;
  status: string;
  visitCard: {
    card: {
      cardId: number;
      cardStatus: string;
      cardVerification: string;
      qrCardTypename: string;
    };
    expiryDate: string;
    issueDate: string;
    visitCardId: number;
    visitCardStatus: string;
    visitDetailId: number;
  };
  visitDetail: {
    expectedEndHour: string;
    expectedStartHour: string;
    visitDetailId: number;
    visitId: number;
    visitorId: number;
  };
  visitorSessionId: number;
}

const CheckOutNormal = () => {
  const { data } = useLocalSearchParams();
  const router = useRouter();
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  const [checkoutResponse, setCheckoutResponse] =
    useState<CheckoutResponse | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckOut>({
    securityOutId: 0,
    gateOutId: Number(selectedGateId) || 0,
  });

  const [checkOutWithCard, { isLoading }] = useCheckOutWithCardMutation();

  // Fetch userId khi component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setCheckoutData((prevState) => ({
            ...prevState,
            securityOutId: Number(storedUserId) || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };
    fetchUserId();
  }, []);

  // Tự động checkout khi có đủ dữ liệu
  useEffect(() => {
    const autoCheckout = async () => {
      if (checkoutData.securityOutId && checkoutData.gateOutId) {
        try {
          const response = await checkOutWithCard({
            qrCardVerifi: data,
            checkoutData: checkoutData,
          }).unwrap();

          setCheckoutResponse(response);
          console.log("Response checkout: ", response);
          Alert.alert("Check out thành công");
          // Tự động chuyển về trang chính sau 3 giây
          // setTimeout(() => {
          //   router.push("/(tabs)/checkin");
          // }, 3000);
        } catch (error: any) {
          const errorMessage =
            error?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";

          Alert.alert("Đã có lỗi xảy ra", errorMessage, [
            {
              text: "OK",
              onPress: () => {
                router.push("/(tabs)/checkin");
              },
            },
          ]);
        }
      }
    };

    autoCheckout();
  }, [checkoutData.securityOutId, checkoutData.gateOutId]);

  const handleBack = () => {
    router.back();
  };

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
  const handleNext = () => {
    router.push({
      pathname: "/(tabs)/checkout",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-4">
      <View>
        <Pressable
          onPress={handleBack}
          className="flex flex-row items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          <Text className="text-gray-600 font-medium">Quay về</Text>
        </Pressable>
      </View>

      <ScrollView>
        <GestureHandlerRootView className="flex-1 p-5">
          {isLoading ? (
            // Loading state
            <View className="flex-1 justify-center items-center p-4">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 mt-4">Đang xử lý checkout...</Text>
            </View>
          ) : checkoutResponse ? (
            // Success state với thông tin response
            <View className="bg-white p-4 rounded-lg shadow">
              <View className="mb-4 bg-green-50 p-3 rounded-lg">
                <Text className="text-green-600 font-bold text-center text-lg mb-2">
                  Checkout thành công
                </Text>
                <Text className="text-green-600 text-center">
                  Tự động quay lại sau 3 giây...
                </Text>
              </View>
              <View className="p-4">
                <Section
                  icon={
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color="#3B82F6"
                    />
                  }
                  title="Trạng thái Checkout"
                >
                  <InfoRow label="Trạng thái" value={checkoutResponse.status} />
                  <InfoRow
                    label="Thời gian check-in"
                    value={formatDate(checkoutResponse.checkinTime)}
                  />
                  <InfoRow
                    label="ID phiên"
                    value={checkoutResponse.visitorSessionId}
                  />
                </Section>

                <SectionDropDown
                  icon={
                    <MaterialIcons
                      name="credit-card"
                      size={24}
                      color="#3B82F6"
                    />
                  }
                  title="Thông tin thẻ"
                >
                  <InfoRow
                    label="Loại thẻ"
                    value={checkoutResponse.visitCard.card.qrCardTypename}
                  />
                  <InfoRow
                    label="Mã thẻ"
                    value={checkoutResponse.visitCard.card.cardVerification}
                  />
                  <InfoRow
                    label="ID thẻ"
                    value={checkoutResponse.visitCard.card.cardId}
                  />
                  <InfoRow
                    label="Trạng thái thẻ"
                    value={checkoutResponse.visitCard.card.cardStatus}
                  />
                  <InfoRow
                    label="ID thẻ thăm"
                    value={checkoutResponse.visitCard.visitCardId}
                  />
                  <InfoRow
                    label="Trạng thái thẻ thăm"
                    value={checkoutResponse.visitCard.visitCardStatus}
                  />
                </SectionDropDown>

                <SectionDropDown
                  icon={
                    <Ionicons name="time-outline" size={24} color="#3B82F6" />
                  }
                  title="Thời gian hiệu lực"
                >
                  <InfoRow
                    label="Ngày phát hành"
                    value={formatDate(checkoutResponse.visitCard.issueDate)}
                  />
                  <InfoRow
                    label="Ngày hết hạn"
                    value={formatDate(checkoutResponse.visitCard.expiryDate)}
                  />
                  <InfoRow
                    label="Giờ bắt đầu"
                    value={checkoutResponse.visitDetail.expectedStartHour}
                  />
                  <InfoRow
                    label="Giờ kết thúc"
                    value={checkoutResponse.visitDetail.expectedEndHour}
                  />
                </SectionDropDown>

                <SectionDropDown
                  icon={
                    <FontAwesome5 name="user-clock" size={20} color="#3B82F6" />
                  }
                  title="Chi tiết thăm"
                >
                  <InfoRow
                    label="ID chi tiết thăm"
                    value={checkoutResponse.visitDetail.visitDetailId}
                  />
                  <InfoRow
                    label="ID thăm"
                    value={checkoutResponse.visitDetail.visitId}
                  />
                  <InfoRow
                    label="ID khách"
                    value={checkoutResponse.visitDetail.visitorId}
                  />
                </SectionDropDown>

                {(checkoutResponse.gateIn || checkoutResponse.securityIn) && (
                  <Section
                    icon={
                      <MaterialIcons
                        name="security"
                        size={24}
                        color="#3B82F6"
                      />
                    }
                    title="Thông tin bảo vệ"
                  >
                    {checkoutResponse.gateIn && (
                      <InfoRow
                        label="Cổng vào"
                        value={checkoutResponse.gateIn}
                      />
                    )}
                    {checkoutResponse.securityIn && (
                      <InfoRow
                        label="Bảo vệ"
                        value={checkoutResponse.securityIn}
                      />
                    )}
                  </Section>
                )}
                <TouchableOpacity
                    onPress={handleNext}
                    className="p-4 mb-4 bg-white rounded-full flex-row items-center justify-center"
                  >
                    <Text className="text-lg mr-2">Xong</Text>
                    <EvilIcons name="arrow-right" size={30} color="black" />
                  </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckOutNormal;
