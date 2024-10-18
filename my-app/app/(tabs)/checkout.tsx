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
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/UI/Header";
import { useEffect, useState } from "react";
import ButtonSingleTextMainColor from '../../components/UI/ButtonSingleTextMainColor';
import { Ionicons } from "@expo/vector-icons";
import { useGetVissitorSessionByCredentialIdQuery } from "@/redux/services/checkout.service";
import { VisitorSessionType } from "@/Types/VisitorSession.Type";
import ModalSearch from "@/components/UI/ModalSearch";

const Checkout = () => {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [cccd, setCccd] = useState("");
  const [visitorSessionData, setVisitorSessionData] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const handleOptionSelect = () => {
    Alert.alert(
      "Chọn phương thức check out",
      "Vui lòng chọn một trong các tùy chọn bên dưới",
      [
        // {
        //   text: "Quét bằng thẻ",
        //   onPress: () => router.push("/check-out/CheckOutCard"),
        // },
        {
          text: "Quét bằng CCCD",
          // onPress: () => router.push("/(tabs)check-out/CheckOutCard"),
        },
        {
          text: "Nhập CCCD",
          onPress: () => {
            setModalVisible(true);
          },
        },
      ]
    );
  };

  const { data, error, isLoading, refetch } = useGetVissitorSessionByCredentialIdQuery(cccd, {
    skip: !cccd,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const handleSeachVisitSessionBCredentialCard = () => {
    if (isLoading) {
      console.log("Đang tải dữ liệu...");
      return;
    }

    // Khi có dữ liệu trả về
    if ( !isLoading && data && !error) {
      console.log(isLoading)
      console.log("Dữ liệu phiên khách:", data);
      router.push("/check-out/CheckOutCard")
      setVisitorSessionData(data);
      setModalVisible(false)
    } else if (error) {
      console.log("Dữ liệu phiên khách:", data);

      Alert.alert("Lỗi", "Không tìm thấy phiên khách với CCCD đã nhập.");
    }
    // console.log(error)
    // console.log(isLoading)
    // console.log(cccd);
  }
  return (
    <SafeAreaView className="flex-1">
      <Header name="Đặng Dương" />
      <View className="flex-1 justify-center mt-[80px] items-center px-4">
        <TouchableOpacity
          onPress={() => setIsCameraActive(true)}
          className="bg-[#34495e] rounded-2xl p-6 items-center justify-center w-64 h-64 shadow-lg"
        >
          <Ionicons name="qr-code-outline" size={100} color="white" />
          <Text className="text-white font-bold text-lg mt-4">
            Quét mã QR
          </Text>
        </TouchableOpacity>
        <View className="p-4 ">
          <Text className="text-2xl font-bold text-[#34495e]">
            Tiến hành check out
          </Text>
        </View>
      </View>
      <View className="items-center justify-center">
        <ButtonSingleTextMainColor
          text="khách mất thẻ"
          onPress={handleOptionSelect}
          width={200}
          height={50}
        />
      </View>
      <View>
        <ModalSearch
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          value={cccd}
          setValue={setCccd}
          handleSearch={handleSeachVisitSessionBCredentialCard}
          isLoading={isLoading}
          error={error}
          placeholder="Nhập CCCD"
        />
      </View>

    </SafeAreaView>
  );
};

export default Checkout;
