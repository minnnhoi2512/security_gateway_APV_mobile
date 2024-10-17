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
import { useState } from "react";
import ButtonSingleTextMainColor from '../../components/UI/ButtonSingleTextMainColor';
import { Ionicons } from "@expo/vector-icons";
import { useGetVissitorSessionByCredentialIdQuery } from "@/redux/services/checkout.service";
import { VisitorSessionType } from "@/Types/VisitorSession.Type";

const Checkout = () => {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [cccd, setCccd] = useState("");
  const [visitorSessionData, setVisitorSessionData] = useState([]);

  const handleOptionSelect = () => {
    Alert.alert(
      "Chọn phương thức check out",
      "Vui lòng chọn một trong các tùy chọn bên dưới",
      [
        {
          text: "Quét bằng thẻ",
          onPress: () => router.push("/check-out/CheckOutCard"),
        },
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
  
  const { data, error, isLoading } = useGetVissitorSessionByCredentialIdQuery(cccd, {
    skip: !cccd, 
    refetchOnFocus: true, 
    refetchOnReconnect: true, 
  });
  const handleSeachVisitSessionBCredentialCard = () =>{
    console.log(error)
    console.log(isLoading)
    console.log(cccd);
    if (data) {
      console.log("Dữ liệu phiên khách:", data);
      setVisitorSessionData(data);
      setModalVisible(false);
    } else if (error) {
      Alert.alert("Lỗi", "Không tìm thấy phiên khách với CCCD đã nhập.");
    }
  }
  return (
    <SafeAreaView>
      <Header name="Đặng Dương" />
      <View className="items-center justify-center">
        <ButtonSingleTextMainColor
          text="Chọn hình thức rời đi"
          onPress={handleOptionSelect}
          width={200}
          height={50}
        />
      </View>
      {visitorSessionData && (
        <View className="mt-4 p-4 bg-white rounded shadow">
          <Text className="text-lg font-bold">Thông tin phiên khách:</Text>
          {visitorSessionData && visitorSessionData.length > 0 ? (
            visitorSessionData.map((session : VisitorSessionType, index : number) => (
              <View key={index} className="mt-2">
              <Text>Thời gian vào: {new Date(session.checkinTime).toLocaleString()}</Text>
              <Text>Thời gian ra: {session.checkoutTime ? new Date(session.checkoutTime).toLocaleString() : 'Chưa ra'}</Text>
              <Text>Cổng vào: {session.gateIn.gateName}</Text>
              <Text>Trạng thái: {session.status}</Text>
              <Text>Người bảo vệ vào: {session.securityIn.fullName}</Text>
              </View>
            ))
          ) : ("")}
        </View>
      )}

      <Modal visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
      >
        <View className='flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]'>
          <View className="w-72 bg-white rounded-lg p-5 items-center shadow-lg">

            <TouchableOpacity
              className="absolute top-3 right-3"
              onPress={() => {setModalVisible(false);
                setCccd("")
              }}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-xl font-bold mb-4">
              Nhập CCCD
            </Text>
            <TextInput className="w-full p-2 border border-gray-300 rounded mb-5"
              onChangeText={(text) => setCccd(text)}
              keyboardType="numeric"
            />
            <TouchableOpacity>
              <ButtonSingleTextMainColor 
              text="Tìm"
              onPress={handleSeachVisitSessionBCredentialCard}
              width={200}
              height={50}/>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
            {error && (
              <Text className="text-red-500 mt-3"> Không tìm thấy khách thăm này</Text>
            ) }
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Checkout;
