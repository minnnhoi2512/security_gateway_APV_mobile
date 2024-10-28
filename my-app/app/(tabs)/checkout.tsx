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
import { useCallback, useEffect, useRef, useState } from "react";
import ButtonSingleTextMainColor from '../../components/UI/ButtonSingleTextMainColor';
import { Ionicons } from "@expo/vector-icons";
import { useGetVissitorSessionByCardverifiedQuery, useGetVissitorSessionByCredentialIdQuery } from "@/redux/services/checkout.service";
import { VisitorSessionType } from "@/Types/VisitorSession.Type";
import ModalSearch from "@/components/UI/ModalSearch";
import { CameraView } from "expo-camera";

const Checkout = () => {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [cccd, setCccd] = useState("");
  const [visitorSessionData, setVisitorSessionData] = useState([]);
  const [qrCardVerified, setQrCardVerified] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const isQrCardSet = useRef(false);
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
  const { data: dataByCredentialCard, error: errorByCredentialCard, isLoading: isLoadingByCredentialCard, isFetching: isFetchinByCredentialCard } = useGetVissitorSessionByCredentialIdQuery(cccd, {
    skip: !cccd,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: dataByCardVerifided, error: errorByCardVerifided, refetch, isFetching: isFetchingByCardVerifided, isLoading: isLoadingByCardVerifided, } = useGetVissitorSessionByCardverifiedQuery(qrCardVerified as string, {
    skip: qrCardVerified===null,

  });

  const handleBarCodeScanned = useCallback(
    async ({ data }: { data: string }) => {

      if (data && !isQrCardSet.current) {
        //qrLock.current = true;
        // const currentTime = new Date().toISOString();
        setQrCardVerified(data);
        //console.log(data);
        setIsCameraActive(false);
        isQrCardSet.current = true;
        //console.log(data);
        //console.log(qrLock);
        // setShowVisitorInfo(true);
        // setCheckOutData((prevState) => ({
        //   ...prevState,
        //   checkoutTime: currentTime,
        // }));
        //qrLock.current = false;
      }
    }, []
  );
  useEffect(() => {
    // console.log("=========2==========");
    // console.log("CardVerified", qrCardVerified);
    // console.log("Error", errorByCardVerifided);
    // console.log("isFetching", isFetchingByCardVerifided);
    // console.log("isLoading", isLoadingByCardVerifided);
    // console.log("data", dataByCardVerifided);
  
    if (qrCardVerified !== null && !isFetchingByCardVerifided && !isLoadingByCardVerifided) {
      if (dataByCardVerifided && !errorByCardVerifided) {
        //console.log("Dữ liệu phiên khách:", dataByCardVerifided);
        // Perform necessary actions with the data
        router.push({
          pathname: '/check-out/CheckOutCard',
          params: { data: JSON.stringify(dataByCardVerifided) , qrCardVerifiedProps: qrCardVerified},
        });
        // setVisitorSessionData(dataByCardVerifided);
        setQrCardVerified(null); // Reset the state to avoid multiple executions
      } else if (errorByCardVerifided) {
        Alert.alert("Lỗi", "Không tìm thấy phiên khách với mã QR đã quét.");
        setQrCardVerified(null); // Reset the state to avoid multiple executions
      }
    }
  }, [qrCardVerified, dataByCardVerifided, errorByCardVerifided, ]);
  const handleSeachVisitSessionBCredentialCard = () => {
    if (isLoadingByCredentialCard) {
      console.log("Đang tải dữ liệu...");
      return;
    }

    // Khi có dữ liệu trả về 
    if (!isLoadingByCredentialCard && !isFetchinByCredentialCard && dataByCredentialCard && !errorByCredentialCard) {
      console.log(isLoadingByCredentialCard)
      console.log("Dữ liệu phiên khách:", dataByCredentialCard);
      router.push("/check-out/CheckOutCard")
      setVisitorSessionData(dataByCredentialCard);
      setModalVisible(false)
    } else if (errorByCredentialCard) {
      console.log("Dữ liệu phiên khách:", dataByCredentialCard);

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
          onPress={() => { setIsCameraActive(true), isQrCardSet.current = false,setQrCardVerified(null);}}
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
        {errorByCardVerifided  && (
          <View className="p-4 ">
            <Text className="text-2xl font-bold text-[#34495e]">
              loi ne
            </Text>
          </View>
        )}
      </View>
      <View className="items-center justify-center">
        <ButtonSingleTextMainColor
          text="khách mất thẻ"
          onPress={handleOptionSelect}
          width={200}
          height={50}
        />
      </View>
      <Modal visible={isCameraActive} animationType="slide" transparent={true}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.cameraView}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={styles.scanningFrame} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCameraActive(false)}
          >
            <Text style={styles.closeButtonText}>Thoát Camera</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <View>
        <ModalSearch
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          value={cccd}
          setValue={setCccd}
          handleSearch={handleSeachVisitSessionBCredentialCard}
          isLoading={isLoadingByCredentialCard}
          error={errorByCredentialCard}
          placeholder="Nhập CCCD"
        />
      </View>

    </SafeAreaView>
  );
};

export default Checkout;
const styles = StyleSheet.create({
  cameraContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    marginVertical: 20,
  },
  cameraView: {
    flex: 1,
  },
  scanningFrame: {
    position: "absolute",
    top: "30%",
    left: "30%",
    width: "40%",
    height: "30%",
    borderWidth: 2,
    borderColor: "yellow",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  scanButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
});