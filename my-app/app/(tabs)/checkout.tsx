import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/UI/Header";
import { useCallback, useEffect, useRef, useState } from "react";
import ButtonSingleTextMainColor from "../../components/UI/ButtonSingleTextMainColor";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetVissitorSessionByCardverifiedQuery,
  useGetVissitorSessionByCredentialIdQuery,
} from "@/redux/services/checkout.service";
import ModalSearch from "@/components/UI/ModalSearch";
import { CameraView } from "expo-camera";
import { SafeAreaProvider } from "react-native-safe-area-context";
import  Overlay  from "../check-in/OverLay";
type CameraType = "QR" | "CREDENTIAL_CARD" | "OTHER_TYPE";
const Checkout = () => {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("OTHER_TYPE");
  const [creadentialCard, setCredentialCard] = useState<string | null>(null);
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
          onPress: () => {
            setCameraType("CREDENTIAL_CARD"),
              setIsCameraActive(true),
              (isQrCardSet.current = false),
              setQrCardVerified(null);
          },
        },
        {
          text: "Nhập CCCD",
          onPress: () => {
            setModalVisible(true);
          },
        },
        {
          text: "Hủy",
          style: "cancel",
          onPress: () => {},
        },
      ]
    );
  };

  const {
    data: dataByCredentialCard,
    error: errorByCredentialCard,
    isLoading: isLoadingByCredentialCard,
    isFetching: isFetchinByCredentialCard,
  } = useGetVissitorSessionByCredentialIdQuery(creadentialCard as string, {
    skip: creadentialCard === null,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const {
    data: dataByCardVerifided,
    error: errorByCardVerifided,
    refetch,
    isFetching: isFetchingByCardVerifided,
    isLoading: isLoadingByCardVerifided,
  } = useGetVissitorSessionByCardverifiedQuery(qrCardVerified as string, {
    skip: qrCardVerified === null,
  });
  useEffect(() => {
    // setCredentialCard('CREDENTIAL_CARD');
    console.log("thẻ:", cameraType);
    console.log("CredentialCard:", creadentialCard);
    console.log("qrCardVerifi:", qrCardVerified);
  }, [cameraType, creadentialCard, qrCardVerified]);
  console.log("Check reder");
  const handleBarCodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isQrCardSet.current) return;

      // console.log("Check", cameraType)
      if (data) {
        if (cameraType === "CREDENTIAL_CARD") {
          if (data.includes("|")) {
            const credentialCardTemp = data.split("|")[0];
            setCredentialCard(credentialCardTemp);
          } else {
            Alert.alert(
              "Lỗi",
              "Cần đưa đúng định dạng thẻ vào camera scan CCCD."
            );
          }
        }
        if (cameraType === "QR") {
          if (!data.includes("|")) {
            setQrCardVerified(data);
          } else {
            Alert.alert(
              "Lỗi",
              "Cần đưa đúng định dạng thẻ vào camera scan QR."
            );
          }
        }
        // console.log("Data:", data);
        setIsCameraActive(false);
        isQrCardSet.current = true;
      }
    },
    [cameraType]
  );

  useEffect(() => {
    if (
      creadentialCard !== null &&
      !isFetchinByCredentialCard &&
      !isLoadingByCredentialCard
    ) {
      console.log("Check useEffect credentailCard", dataByCredentialCard);
      console.log("Check useEffect credentailCard", errorByCredentialCard);
      if (dataByCredentialCard && !errorByCredentialCard) {
        router.push({
          pathname: "/check-out/CheckOutCard",
          params: {
            data: JSON.stringify(dataByCredentialCard),
            qrCardVerifiedProps: null,
          },
        });
        console.log("Oke");
      } else if (errorByCredentialCard) {
        Alert.alert("Lỗi", "Không tìm thấy phiên khách với mã CCCD đã quét.");
        // setQrCardVerified(null);
      }
      setCredentialCard(null);
    }
  }, [creadentialCard, dataByCredentialCard, errorByCredentialCard]);

  useEffect(() => {
    if (
      qrCardVerified !== null &&
      !isFetchingByCardVerifided &&
      !isLoadingByCardVerifided
    ) {
      if (dataByCardVerifided && !errorByCardVerifided) {
        router.push({
          pathname: "/check-out/CheckOutCard",
          params: {
            data: JSON.stringify(dataByCardVerifided),
            qrCardVerifiedProps: qrCardVerified,
          },
        });
      } else if (errorByCardVerifided) {
        Alert.alert("Lỗi", "Không tìm thấy phiên khách với mã QR đã quét.");
      }
      setQrCardVerified(null);
    }
  }, [qrCardVerified, dataByCardVerifided, errorByCardVerifided]);
  const handleSeachVisitSessionBCredentialCard = () => {
    if (isLoadingByCredentialCard) {
      console.log("Đang tải dữ liệu...");
      return;
    }

    // Khi có dữ liệu trả về
    if (
      !isLoadingByCredentialCard &&
      !isFetchinByCredentialCard &&
      dataByCredentialCard &&
      !errorByCredentialCard
    ) {
      console.log(isLoadingByCredentialCard);
      console.log("Dữ liệu phiên khách:", dataByCredentialCard);
      router.push("/check-out/CheckOutCard");
      setVisitorSessionData(dataByCredentialCard);
      setModalVisible(false);
    } else if (errorByCredentialCard) {
      console.log("Dữ liệu phiên khách:", dataByCredentialCard);

      Alert.alert("Lỗi", "Không tìm thấy phiên khách với CCCD đã nhập.");
    }
  };

  const handlePress = () => {
    setCameraType("QR");
    setIsCameraActive(true);
    isQrCardSet.current = false;
    setQrCardVerified(null);
  };


  return (
    <SafeAreaProvider className="flex-1 bg-backgroundApp">
      <View className="flex-1 bg-white">
        <Header name="Đặng Dương" />
        <View className="flex-1 justify-center mt-20 items-center px-4">
          <TouchableOpacity
            onPress={handlePress}
            className="bg-[#34495e] rounded-2xl p-6 items-center justify-center w-64 h-64 shadow-lg"
          >
            <Ionicons name="qr-code-outline" size={100} color="white" />
            <Text className="text-white font-bold text-lg mt-4">
              Quét mã QR
            </Text>
          </TouchableOpacity>
          <View className="p-4">
            <Text className="text-2xl font-bold text-[#34495e]">
              Tiến hành check out
            </Text>
          </View>
          {errorByCardVerifided && (
            <View className="p-4">
              <Text className="text-2xl font-bold text-[#34495e]">loi ne</Text>
            </View>
          )}
        </View>
        <View className="items-center justify-center mb-44">
          <ButtonSingleTextMainColor
            text="khách mất thẻ"
            onPress={handleOptionSelect}
            width={200}
            height={50}
          />
        </View>
        <Modal
          visible={isCameraActive}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 bg-black justify-center items-center">
            <CameraView
              className="flex-1 w-full h-full"
              onBarcodeScanned={handleBarCodeScanned}
            />
            <Overlay />
            {/* <View className="absolute top-1/3 left-1/4 w-2/4 h-1/3 border-2 border-yellow-500 rounded-lg shadow-lg" /> */}
            <View className="absolute top-14 left-4 bg-white px-3 py-2 rounded-md shadow-lg">
              <Text className="text-green-700 text-sm font-semibold">
                Camera Checkout
              </Text>
            </View>

            <TouchableOpacity
              className="absolute top-14 right-4 bg-black bg-opacity-50 px-3 py-3 rounded"
              onPress={() => setIsCameraActive(false)}
            >
              <Text className="text-white">Thoát Camera</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <View>
          <ModalSearch
            isVisible={isModalVisible}
            onClose={() => setModalVisible(false)}
            value={creadentialCard === null ? "" : creadentialCard}
            setValue={setCredentialCard}
            handleSearch={() => {}}
            isLoading={false}
            error={null}
            placeholder="Nhập CCCD"
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
};

export default Checkout;
