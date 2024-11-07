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
import { Ionicons } from "@expo/vector-icons";

import Header from "@/components/UI/Header";
import { RootState } from "@/redux/store/store";
import { useGetVisitorByIdQuery } from "@/redux/services/visitor.service";

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
  const [checkOutWithCard, { isLoading: isloadingWithCard }] = useCheckOutWithCardMutation();
  const [checkOutWithCredentialCard, { isLoading: isLoadingWithCredentialcard }] = useCheckOutWithCredentialCardMutation();
  const { data: dataVisitorSessionImage, error: errorVisitorSessionImage, refetch, isFetching: isFetchingVisitorSessionImage, isLoading: isLoadingVisitorSessionImage, } = useGetVisitorImageByVisitorSessionIdQuery(visitData.visitorSessionId, {});
  const { data: dataVisitor, error: errorVisitor, refetch: refetchVisitor, isFetching: isFetchingVisitor, isLoading: isLoadingVisitor, } = useGetVisitorByIdQuery(visitData.visitDetail.visitorId, {});
  // console.log(dataVisitor);
  const [refreshing, setRefreshing] = useState(false);
  const [checkOutData, setCheckOutData] = useState({
    securityOutId: 0,
    gateOutId: Number(selectedGateId) || 0,
  });

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
      Alert.alert("Thành công", "Checkout thành công!");
      router.push("/(tabs)/");
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert("Lỗi", "Checkout thất bại.");
    }
  };

  // const onRefresh = useCallback(async () => {
  //   setRefreshing(true);
  //   if (qrCardVerified) {
  //     await refetch();
  //   }
  //   setRefreshing(false);
  // }, [qrCardVerified, refetch]);
  if (!isPermissionGranted) {
    return (
      <View>
        <Text>Permission not granted</Text>
        <Button title="Request permission" onPress={requestPermission}></Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header name="Đặng Dương" />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing}
          // onRefresh={onRefresh} 
          />
        }
      >
        {data && data.length > 0 ? (
          <View style={styles.visitorInfoContainer}>
            <Text style={styles.title}>Thông tin checkin của khách</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Thời gian vào:</Text>
              <Text style={styles.value}>
                {formatDate(visitData.checkinTime)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cổng vào:</Text>
              <Text style={styles.value}>
                {visitData.gateIn.gateName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Bảo vệ:</Text>
              <Text style={styles.value}>
                {visitData.securityIn.fullName}
              </Text>
            </View>
            <Text style={styles.subTitle}>Hình ảnh vào</Text>
            <View style={styles.imagesContainer}>
              {dataVisitorSessionImage && dataVisitorSessionImage.map(
                (
                  image: { imageURL: string; imageType: string },
                  index: number
                ) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image
                      source={{ uri: "https://img.freepik.com/premium-psd/blue-sport-sneakers-shoes-isolated-transparent-background-png-psd_888962-1190.jpg" }}
                      style={styles.image}
                    />
                    <Text style={styles.imageType}>
                      {image.imageType === "Shoe" ? "Giày" : "Ảnh khách hàng"}
                    </Text>
                  </View>
                )
              )}
            </View>
            <Text style={styles.subTitle}>Thông tin thẻ</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngày cấp:</Text>
              <Text style={styles.value}>{visitData.visitCard.issueDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngày hết hạn:</Text>
              <Text style={styles.value}>{visitData.visitCard.expiryDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Trạng thái thẻ:</Text>
              <Text style={styles.value}>{visitData.visitCard.card.cardStatus}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Hình ảnh thẻ:</Text>
              <Image
                style={styles.cardImage}
                source={{ uri: `data:image/png;base64,${visitData.visitCard.card.cardImage}` }}
              />
            </View>
            <Text style={styles.subTitle}>Thông tin chi tiết chuyến thăm</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Giờ dự kiến vào:</Text>
              <Text style={styles.value}>{visitData.visitDetail.expectedStartHour}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Giờ dự kiến ra:</Text>
              <Text style={styles.value}>{visitData.visitDetail.expectedEndHour}</Text>
            </View>
            <Text style={styles.subTitle}>Thông tin chi tiết khách</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tên đầy đủ:</Text>
              <Text style={styles.value}>{dataVisitor?.visitorName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Hình ảnh:</Text>
              <Image
                style={styles.cardImage}
                source={{ uri: `data:image/png;base64,${dataVisitor?.visitorCredentialImage}` }}
              />
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isLoadingWithCredentialcard || isloadingWithCard}
            >
              <Text style={styles.buttonText}>
                Xác nhận Checkout
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          ""
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckoutCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  visitorInfoContainer: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: "right",
  },
  statusText: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  imagesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginBottom: 5,
  },
  imageType: {
    fontStyle: "italic",
    color: "#666",
  },
  checkoutButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  scannerContainer: {
    alignItems: "center",
  },
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

  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  cardImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});
