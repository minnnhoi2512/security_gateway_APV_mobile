import {
  View,
  Text,
  Alert,
  SafeAreaView,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useCheckOutWithCardMutation,
  useGetVissitorSessionByCardverifiedQuery,
} from "@/redux/services/checkout.service";
import { useGetCameraByGateIdQuery } from "@/redux/services/gate.service";
import * as FileSystem from "expo-file-system";
import { useShoeDetectMutation } from "@/redux/services/qrcode.service";
import { uploadToFirebase } from "@/firebase-config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const fetchCaptureImage = async (
  url: string,
  imageType: string
): Promise<{ ImageType: string; ImageFile: string | null }> => {
  try {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      // console.error("HTTP Response Status:", response.status);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();
    const fileUri = `${FileSystem.cacheDirectory}captured-image-${imageType}.jpg`;

    const fileSaved = await new Promise<string | null>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = async () => {
        const base64data = fileReader.result?.toString().split(",")[1];
        if (base64data) {
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve(fileUri);
        } else {
          reject(null);
        }
      };
      fileReader.readAsDataURL(blob);
    });

    return {
      ImageType: imageType,
      ImageFile: fileSaved,
    };
  } catch (error) {
    return { ImageType: imageType, ImageFile: null };
  }
};
interface CheckoutResponse {
  checkinTime: string;
  gateIn: any;
  securityIn: any;
  status: string;
  visitCard: {
    card: {
      cardId: number;
      cardImage: string;
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
interface ICheckOutData {
  securityOutId: number;
  gateOutId: number;
  vehicleSession?: {
    licensePlate: string;
    vehicleImages: {
      imageType: string;
      imageURL: string;
    };
  };
  images?: updateImage[];
}
type updateImage = {
  imageType: string;
  imageURL: string;
};
interface ImageFile {
  uri: string;
  type: string;
  name: string;
}
const CheckOutNormal = () => {
  const { qrString } = useLocalSearchParams();
  const router = useRouter();
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );
  const [handleValidShoe, setHandleValidShoe] = useState(false);
  const gateId = Number(selectedGateId) || 0;
  const { data: cameraGate } = useGetCameraByGateIdQuery(
    { gateId },
    {
      skip: !gateId,
    }
  );
  const [validData, setValidData] = useState<boolean>(false);
  const [validImageShoeUrl, setValidImageShoeUrl] = useState<string>("");
  const [validImageBodyUrl, setValidImageBodyUrl] = useState<string>("");
  const [checkOutWithCard] = useCheckOutWithCardMutation();

  const {
    data: checkInData,
    isLoading,
    refetch,
  } = useGetVissitorSessionByCardverifiedQuery(qrString as string);
  const resetData = async () => {
    setTimeout(async () => {
      const result = await refetch();

      if (result.error) {
        const error = result.error as FetchBaseQueryError;
        if (
          "data" in error &&
          error.data &&
          typeof error.data === "object" &&
          "message" in error.data
        ) {
          return (() => {
            Alert.alert(
              "Lỗi",
              `${(error.data as { message: string }).message}`
            );
            handleBack();
          })();
        } else {
          return (() => {
            handleBack();
            Alert.alert("Lỗi", "Đã xảy ra lỗi không xác định");
          })();
        }
      } else {
        setValidData(true);
      }
      if (result?.data?.vehicleSession != null) {
        return (() => {
          handleBack();
          Alert.alert("Khách này sử dụng phương tiện", "Vui lòng thử lại.");
        })();
      }
    }, 5000);
  };
  const [shoeDetectMutation] = useShoeDetectMutation();
  useEffect(() => {
    resetData();
  }, [qrString]);
  useEffect(() => {
    if (validData) {
      captureImageBody();
      captureImageShoe();
    }
  }, [validData]);

  const fetchWithTimeout = (promise: any, timeout: any) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  };
  const captureImageShoe = async () => {
    if (checkInData && Array.isArray(cameraGate)) {
      const camera = cameraGate.find(
        (camera) => camera?.cameraType?.cameraTypeId === 3
      );
      if (camera) {
        try {
          let checkOutShoe: { ImageType: string; ImageFile: string | null } = {
            ImageType: "checkOutShoe",
            ImageFile: null,
          };
          try {
            checkOutShoe = await fetchWithTimeout(
              fetchCaptureImage(
                `${camera.cameraURL}capture-image`,
                "CheckOut_Shoe"
              ),
              3000
            );
          } catch (error) {
            Alert.alert("Lỗi", "Đã xảy ra lỗi với hệ thống camera");
            handleBack();
            return;
          }
          if (checkOutShoe.ImageFile === null) {
            handleBack();
            Alert.alert("Lỗi", "Đã xảy ra lỗi với hệ thống camera");
            return;
          }
          const imageValid: ImageFile = {
            name: "CheckOut_Shoe",
            type: "image/jpeg",
            uri: checkOutShoe.ImageFile || "",
          };
          const validShoe = await shoeDetectMutation(imageValid);

          if (validShoe.error) {
            handleBack();
            Alert.alert("Lỗi", "Giày không hợp lệ");
            return;
          } else if (validShoe.data.confidence > 50) {
            const { downloadUrl: shoeValidImageUrl } = await uploadToFirebase(
              imageValid.uri,
              `shoeCheckout_${Date.now()}.jpg`
            );

            setValidImageShoeUrl(shoeValidImageUrl);
            setHandleValidShoe(true);
          } else {
            handleBack();
            Alert.alert("Lỗi", "Giày không hợp lệ");
            return;
          }
        } catch (error) {
          handleBack();
          Alert.alert("Lỗi", "Đã xảy ra lỗi khi xác minh giày");
          return;
        }
      }
    }
  };
  const captureImageBody = async () => {
    if (checkInData && Array.isArray(cameraGate)) {
      const camera = cameraGate.find(
        (camera) => camera?.cameraType?.cameraTypeId === 4
      );
      if (camera) {
        try {
          let checkOutBody: { ImageType: string; ImageFile: string | null } = {
            ImageType: "CheckOut_Body",
            ImageFile: null,
          };

          try {
            checkOutBody = await fetchWithTimeout(
              fetchCaptureImage(
                `${camera.cameraURL}capture-image`,
                "CheckOut_Body"
              ),
              3000
            );
          } catch (error) {
            Alert.alert("Lỗi", "Đã xảy ra lỗi với hệ thống camera");
            handleBack();
            return;
          }
          if (checkOutBody.ImageFile === null) {
            handleBack();
            Alert.alert("Lỗi", "Đã xảy ra lỗi với hệ thống camera");
            return;
          }
          const imageValid: ImageFile = {
            name: "CheckOut_Body",
            type: "image/jpeg",
            uri: checkOutBody.ImageFile || "",
          };
          const { downloadUrl: bodyValidImageUrl } = await uploadToFirebase(
            imageValid.uri,
            `bodyCheckout_${Date.now()}.jpg`
          );
          setValidImageBodyUrl(bodyValidImageUrl);
        } catch (error) {
          handleBack();
          Alert.alert("Lỗi", "Đã xảy ra lỗi với hệ thống camera");
          return;
        }
      }
    }
  };
  const handleBack = () => {
    router.navigate({
      pathname: "/(tabs)/checkout",
    });
  };

  const InfoRow = ({
    label,
    value,
    isImage = false,
  }: {
    label: string;
    value: string | number;
    isImage?: boolean;
  }) => (
    <View className="py-2">
      <Text className="text-gray-500 text-sm mb-1">{label}</Text>
      {isImage && typeof value === "string" && value ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${value}` }}
          className="w-full h-48 rounded-lg"
          resizeMode="contain"
        />
      ) : (
        <Text className="text-black text-sm font-medium">{value}</Text>
      )}
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
  const handleCheckOut = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    try {
      const checkOutData: ICheckOutData = {
        securityOutId: Number(storedUserId),
        gateOutId: gateId,
        images: [
          {
            imageType: "CheckOut_Body",
            imageURL: validImageBodyUrl,
          },
          {
            imageType: "CheckOut_Shoe",
            imageURL: validImageShoeUrl,
          },
        ],
      };

      Alert.alert(
        "Xác nhận",
        "Bạn có muốn xác nhận ra không?",
        [
          {
            text: "Hủy",
            onPress: () => {
              // Handle cancel action if needed
            },
          },
          {
            text: "Đồng ý",
            onPress: async () => {
              try {
                const response = await checkOutWithCard({
                  qrCardVerifi: qrString as string,
                  checkoutData: checkOutData,
                });
                router.navigate({
                  pathname: "/(tabs)/checkout",
                });
                if (response.error) {
                  const error = response.error as FetchBaseQueryError;
                  if (
                    "data" in error &&
                    error.data &&
                    typeof error.data === "object" &&
                    "message" in error.data
                  ) {
                    Alert.alert(
                      "Lỗi",
                      `${(error.data as { message: string }).message}`
                    );
                  } else {
                    Alert.alert("Lỗi", "Đã xảy ra lỗi không xác định");
                  }
                } else {
                  Alert.alert("Thành công", "Xác nhận ra thành công");
                }
              } catch (error) {
                console.log(error);
                Alert.alert("Lỗi", "Đã xảy ra lỗi khi xác nhận ra");
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert("Thất bại", "Đã xảy ra lỗi khi xác nhận ra");
    }
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

  // if (isError) {
  //   handleBack();
  //   Alert.alert("Lỗi", "Vui lòng gán thông tin người dùng lên thẻ");
  // }
  if (!validData) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang xử lý thông tin</Text>
      </View>
    );
  } else {
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
            {!isLoading && checkInData ? (
              <View className="bg-backgroundApp p-4 rounded-lg shadow">
                <View className="mb-4 bg-green-50 p-3 rounded-lg">
                  <Text className="text-green-600 font-bold text-center text-lg mb-2">
                    Bảng thông tin
                  </Text>
                </View>
                <View className="p-4">
                  <Section
                    icon={
                      <View className="w-6 h-6 bg-purple-500 rounded-full" />
                    }
                    title="Trạng thái"
                  >
                    <InfoRow
                      label="Thời gian vào công ty"
                      value={formatDate(checkInData.checkinTime)}
                    />
                    {checkInData.gateIn && (
                      <InfoRow
                        label="Cổng vào"
                        value={checkInData.gateIn.gateName}
                      />
                    )}
                    {checkInData.gateIn && (
                      <InfoRow
                        label="Khách"
                        value={checkInData.visitDetail.visitor.visitorName}
                      />
                    )}
                    {checkInData.securityIn && (
                      <InfoRow
                        label="Bảo vệ"
                        value={checkInData.securityIn.fullName}
                      />
                    )}
                    <InfoRow
                      label="Trạng thái"
                      value={
                        checkInData.status === "CheckIn"
                          ? "Đã vào"
                          : checkInData.status === "CheckOut"
                          ? "Đã ra"
                          : checkInData.status
                      }
                    />

                    <InfoRow
                      label="Trạng thái chuyến thăm"
                      value={checkInData.visitDetail.visit.visitStatus}
                    />
                  </Section>

                  <SectionDropDown
                    icon={
                      <View className="w-6 h-6 bg-green-500 rounded-full" />
                    }
                    title="Thông tin thẻ"
                  >
                    <InfoRow
                      label="Loại thẻ"
                      value={
                        checkInData.visitCard.card.qrCardTypename
                          ? "Loại thẻ: " +
                            checkInData.visitCard.card.qrCardTypename
                          : "Theo ngày"
                      }
                    />
                    <InfoRow
                      label="Mã thẻ"
                      value={checkInData.visitCard.card.cardVerification}
                    />
                    <InfoRow
                      label="Trạng thái thẻ"
                      value={
                        checkInData.visitCard.card.cardStatus === "Active"
                          ? "Còn hiệu lực"
                          : checkInData.visitCard.card.cardStatus === "Inactive"
                          ? "Hết hiệu lực"
                          : checkInData.visitCard.card.cardStatus === "Lost"
                          ? "Mất thẻ"
                          : checkInData.visitCard.card.cardStatus
                      }
                    />
                    <InfoRow
                      label="Hình ảnh thẻ"
                      value={checkInData.visitCard.card.cardImage}
                      isImage={true}
                    />
                  </SectionDropDown>

                  <SectionDropDown
                    icon={
                      <View className="w-6 h-6 bg-orange-500 rounded-full" />
                    }
                    title="Thời gian hiệu lực"
                  >
                    <InfoRow
                      label="Ngày phát hành"
                      value={formatDate(checkInData.visitCard.issueDate)}
                    />
                    <InfoRow
                      label="Ngày hết hạn"
                      value={formatDate(checkInData.visitCard.expiryDate)}
                    />
                    <InfoRow
                      label="Giờ bắt đầu"
                      value={checkInData.visitDetail.expectedStartHour}
                    />
                    <InfoRow
                      label="Giờ kết thúc"
                      value={checkInData.visitDetail.expectedEndHour}
                    />
                  </SectionDropDown>

                  <SectionDropDown
                    title="Hình ảnh xác minh"
                    icon={
                      <View className="w-6 h-6 bg-yellow-500 rounded-full" />
                    }
                  >
                    <View>
                      <Text className="text-xl font-bold">Ảnh lúc vào</Text>
                      {checkInData?.vehicleSession &&
                        checkInData?.vehicleSession?.images
                          .filter(
                            (image: { imageType: string }) =>
                              image.imageType !== ""
                          )
                          .map(
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
                              </View>
                            )
                          )}
                      {checkInData.visitorSessionsImages &&
                        checkInData.visitorSessionsImages
                          .filter(
                            (image: { imageType: string }) =>
                              image.imageType !== "CheckOut_Shoe"
                          )
                          .map(
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
                              </View>
                            )
                          )}
                    </View>
                    <View>
                      <Text className="text-xl font-bold">Ảnh lúc ra</Text>
                      {validImageShoeUrl != "" ? (
                        <Image
                          source={{
                            uri: validImageShoeUrl,
                          }}
                          style={{
                            width: "100%",
                            height: 200,
                            borderRadius: 10,
                            marginVertical: 10,
                          }}
                          resizeMode="contain"
                        />
                      ) : (
                        <ActivityIndicator size="large" color="#0000ff" />
                      )}
                      {validImageBodyUrl != "" ? (
                        <Image
                          source={{
                            uri: validImageBodyUrl,
                          }}
                          style={{
                            width: "100%",
                            height: 200,
                            borderRadius: 10,
                            marginVertical: 10,
                          }}
                          resizeMode="contain"
                        />
                      ) : (
                        <ActivityIndicator size="large" color="#0000ff" />
                      )}
                    </View>
                  </SectionDropDown>

                  <TouchableOpacity
                    onPress={handleCheckOut}
                    className="p-4 mb-4 bg-white rounded-full flex-row items-center justify-center"
                  >
                    <Text className="text-lg mr-2">Xác nhận</Text>
                    <EvilIcons name="arrow-right" size={30} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </GestureHandlerRootView>
        </ScrollView>
      </SafeAreaView>
    );
  }
};

export default CheckOutNormal;
