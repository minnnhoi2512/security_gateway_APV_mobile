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
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/Header";

const Checkout = () => {
  const router = useRouter();

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
          // onPress: () => router.push("/(tabs)check-out/CheckOutCard"),
        },
      ]
    );
  };
  return (
    <SafeAreaView>
      <Header name="Đặng Dương" />
      <ScrollView>
       <TouchableOpacity onPress={handleOptionSelect}>
        <Text>Chọn hình thức checkout</Text>
       </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Checkout;
