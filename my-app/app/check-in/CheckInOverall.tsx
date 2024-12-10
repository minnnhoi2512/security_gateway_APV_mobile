import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  StyleSheet,
  Modal,
  ImageBackground,
} from "react-native";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { CheckInVerWithLP } from "@/Types/checkIn.type";
import {
  useCheckInMutation,
  useValidCheckInMutation,
} from "@/redux/services/checkin.service";
import { uploadToFirebase } from "@/firebase-config";
import { useToast } from "@/components/Toast/ToastContext";
import ImageViewer from "react-native-image-zoom-viewer";
import { IImageInfo } from "react-native-image-zoom-viewer/built/image-viewer.type";

interface Visitor {
  visitorId: number;
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  credentialsCard: string;
  visitorCredentialImage: string;
  status: string;
}

interface Visit {
  visitId: number;
  visitName: string;
  visitQuantity: number;
  createByname: string | null;
  scheduleTypeName: string;
}

interface Card {
  cardId: number;
  cardVerification: string;
  cardImage: string;
  cardStatus: string;
  qrCardTypename: string | null;
}

interface ResultData {
  visitDetailId: number;
  expectedStartHour: string;
  expectedEndHour: string;
  status: string;
  visitor: Visitor;
  visit: Visit;
  cardRes: Card;
}

interface ImageSectionDropdownProps {
  title: string;
  icon: React.ReactNode;
  imageUris: string[];
}

interface ImageSectionProps {
  visitorImage: string;
}

interface ImageSliderProps {
  response?: any;
  checkInData?: any;
}

const CheckInOverall = () => {
  const { dataCheckIn } = useLocalSearchParams();
  const [checkInStatus, setCheckInStatus] = useState<
    "pending" | "success" | "error"
  >("pending");

  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const router = useRouter();
  const { showToast } = useToast();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [checkInMessage, setCheckInMessage] = useState<string>("");
  const selectedGateId = useSelector(
    (state: RootState) => state.gate.selectedGateId
  );

  const parsedDataCheckIn = useMemo(() => {
    try {
      if (typeof dataCheckIn === "string") {
        const parsed = JSON.parse(dataCheckIn);
        if (parsed.__type === "CheckInVerWithLP") {
          delete parsed.__type;
          return {
            ...parsed,
            VehicleSession: parsed.VehicleSession || {
              LicensePlate: "",
              vehicleImages: [],
            },
          };
        }
        return parsed;
      }
      return dataCheckIn;
    } catch (error) {
      console.error("Error parsing dataCheckIn:", error);
      return null;
    }
  }, [dataCheckIn]);

  const [checkInData, setCheckInData] = useState<CheckInVerWithLP>({
    CredentialCard: parsedDataCheckIn?.CredentialCard || null,
    SecurityInId: parsedDataCheckIn?.SecurityInId || 0,
    GateInId: parsedDataCheckIn?.GateInId || Number(selectedGateId) || 0,
    QrCardVerification: parsedDataCheckIn?.QrCardVerification || "",
    Images: parsedDataCheckIn?.Images || [],
    VehicleSession: parsedDataCheckIn?.VehicleSession || {
      LicensePlate: "",
      vehicleImages: [],
    },
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setCheckInData((prevState) => ({
            ...prevState,
            SecurityInId: Number(storedUserId) || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const performCheckIn = async () => {
      setCheckInMessage("");
      setCheckInStatus("pending");

      try {
        if (
          !checkInData ||
          !checkInData.Images ||
          checkInData.Images.length < 1
          // ||
          // !checkInData.Images[0] ||
          // !checkInData.Images[1]
        ) {
          throw new Error("Missing image data for check-in.");
        }

        const formData = new FormData();

        formData.append(
          "CredentialCard",
          checkInData.CredentialCard
            ? checkInData.CredentialCard.toString()
            : ""
        );
        formData.append("SecurityInId", checkInData.SecurityInId.toString());
        formData.append("GateInId", checkInData.GateInId.toString());
        formData.append("QrCardVerification", checkInData.QrCardVerification);

        const shoeImage = checkInData.Images[1];
        const { downloadUrl: shoeImageUrl } = await uploadToFirebase(
          shoeImage.Image,
          `shoe_${Date.now()}.jpg`
        );
        formData.append("Images[1].ImageType", shoeImage.ImageType);
        formData.append("Images[1].ImageURL", shoeImageUrl.replace(/"/g, ""));
        formData.append("Images[1].Image", {
          uri: shoeImage.Image,
          name: shoeImage.Image.split("/").pop() || "default.jpg",
          type: "image/jpeg",
        } as any);

        const bodyImage = checkInData.Images[0];
        const { downloadUrl: bodyImageUrl } = await uploadToFirebase(
          bodyImage.Image,
          `body_${Date.now()}.jpg`
        );
        formData.append("Images[0].ImageType", bodyImage.ImageType);
        formData.append("Images[0].ImageURL", bodyImageUrl.replace(/"/g, ""));
        formData.append("Images[0].Image", {
          uri: bodyImage.Image,
          name: bodyImage.Image.split("/").pop() || "default.jpg",
          type: "image/jpeg",
        } as any);

        if (
          checkInData.VehicleSession &&
          checkInData.VehicleSession.LicensePlate &&
          checkInData.VehicleSession.vehicleImages &&
          checkInData.VehicleSession.vehicleImages.length > 0
        ) {
          formData.append(
            "VehicleSession.LicensePlate",
            checkInData.VehicleSession.LicensePlate
          );

          const vehicleImage = checkInData.VehicleSession.vehicleImages[0];

          if (vehicleImage && vehicleImage.Image) {
            const { downloadUrl: licensePlateImageUrl } =
              await uploadToFirebase(
                vehicleImage.Image,
                `license_plate_${Date.now()}.jpg`
              );

            formData.append(
              "VehicleSession.VehicleImages[0].ImageType",
              "CheckIn_Vehicle"
            );
            formData.append(
              "VehicleSession.VehicleImages[0].ImageURL",
              licensePlateImageUrl.replace(/"/g, "")
            );
          }
        }

        console.log("Form data being sent:", formData);

        const response = await checkIn(formData).unwrap();
        
        setResultData(response);
        setCheckInStatus("success");
        setCheckInMessage("Bạn vừa check in thành công!");
        showToast("Bạn vừa check in thành công!", "success");
      } catch (error: any) {
        // console.log("err check in:", error);
        setCheckInStatus("error");
        const errorMessage =
          error?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
        showToast("Đã có lỗi xảy ra", "error");
        Alert.alert("Đã có lỗi xảy ra", errorMessage, [
          {
            text: "OK",
            onPress: () => {
              router.navigate({
                pathname: "/check-in/ListVisit",
                params: { credentialCardId: parsedDataCheckIn?.CredentialCard },
              });
            },
          },
        ]);
      }
    };

    performCheckIn();
  }, []);

  // console.log("chedck da: ", checkInData);

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push({
      pathname: "/(tabs)/checkin",
    });
  };

  const ImageSliderForBodyShoe: React.FC<ImageSliderProps> = ({
    response,
    checkInData,
  }) => {
    const [isImageViewVisible, setIsImageViewVisible] =
      useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const images = useMemo<IImageInfo[]>(() => {
      const allImages: IImageInfo[] = [];

      // if (response?.visitor.visitorCredentialFrontImage) {
      //   allImages.push({
      //     url: `data:image/png;base64,${response.visitor.visitorCredentialFrontImage}`,
      //   });
      // }

      checkInData?.Images?.forEach((img: any) => {
        if (img.Image) {
          allImages.push({
            url: img.Image,
          });
        }
      });

      // if (checkInData?.VehicleSession?.vehicleImages?.[0]?.Image) {
      //   allImages.push({
      //     url: checkInData.VehicleSession.vehicleImages[0].Image,
      //   });
      // }

      return allImages;
    }, [response, checkInData]);

    return (
      <View className="mt-4 w-full">
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setCurrentImageIndex(index);
                setIsImageViewVisible(true);
              }}
              className="mr-1"
              style={{
                width: 200,
                aspectRatio: 4 / 3,
              }}
            >
              <Image
                source={{ uri: image.url }}
                style={{
                  width: "100%",
                  height: "90%",
                  borderRadius: 8,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Modal
          visible={isImageViewVisible}
          transparent={true}
          onRequestClose={() => setIsImageViewVisible(false)}
        >
          <ImageViewer
            imageUrls={images}
            enableSwipeDown={true}
            onSwipeDown={() => setIsImageViewVisible(false)}
            onCancel={() => setIsImageViewVisible(false)}
            index={currentImageIndex}
            backgroundColor="rgba(0, 0, 0, 0.9)"
            renderHeader={() => (
              <TouchableOpacity
                onPress={() => setIsImageViewVisible(false)}
                style={{
                  position: "absolute",
                  top: 40,
                  right: 20,
                  zIndex: 100,
                  padding: 10,
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
            renderIndicator={(currentIndex?: number, allSize?: number) => {
              if (
                typeof currentIndex === "number" &&
                typeof allSize === "number"
              ) {
                return (
                  <View
                    style={{
                      position: "absolute",
                      top: 40,
                      left: 20,
                      zIndex: 100,
                    }}
                  >
                    <Text style={{ color: "white" }}>
                      {`${currentIndex + 1}/${allSize}`}
                    </Text>
                  </View>
                );
              }
              return <View />;
            }}
          />
        </Modal>
      </View>
    );
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

  const ImageSectionDropdown: React.FC<ImageSectionDropdownProps> = ({
    title,
    icon,
    imageUris,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!imageUris || imageUris.length === 0) return null;

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

        {isOpen && (
          <View className="p-4">
            {imageUris.map((uri, index) => {
              // Tạo unique key bằng cách kết hợp index và uri
              const uniqueKey = `image-${index}-${uri.split("/").pop()}`;

              return (
                <TouchableOpacity
                  key={uniqueKey}
                  onPress={() => {
                    setSelectedImageIndex(index);
                    setIsImageViewerVisible(true);
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 10,
                      marginVertical: 10,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}

            <Modal visible={isImageViewerVisible} transparent={true}>
              <ImageViewer
                imageUrls={imageUris.map((uri, index) => ({
                  url: uri,
                  props: {
                    // Thêm key cho mỗi image trong ImageViewer
                    key: `viewer-image-${index}-${uri.split("/").pop()}`,
                  },
                }))}
                enableSwipeDown
                index={selectedImageIndex}
                onSwipeDown={() => setIsImageViewerVisible(false)}
                onClick={() => setIsImageViewerVisible(false)}
                backgroundColor="rgba(0,0,0,0.9)"
              />
            </Modal>
          </View>
        )}
      </View>
    );
  };

  const InfoRowTime = ({
    label,
    value1,
    value2,
  }: {
    label: string;
    value1: string | number;
    value2: string | number;
  }) => (
    <View className="flex-row justify-between py-2">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-black text-sm font-medium">
        {value1} - {value2}
      </Text>
    </View>
  );

  const ImageSection: React.FC<ImageSectionProps> = ({ visitorImage }) => {
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);

    // Cấu hình ảnh cho ImageViewer
    const images = [
      {
        url: "",
        props: {
          source: {
            uri: `data:image/png;base64,${visitorImage}`,
          },
        },
      },
    ];

    return (
      <View className="mt-4 items-center">
        <Text className="text-gray-500 text-sm mb-2">QR Code</Text>

        <TouchableOpacity
          onPress={() => setIsImageViewVisible(true)}
          className="w-32 h-32"
        >
          <Image
            source={{
              uri: `data:image/png;base64,${visitorImage}`,
            }}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Modal
          visible={isImageViewVisible}
          transparent={true}
          onRequestClose={() => setIsImageViewVisible(false)}
        >
          <ImageViewer
            imageUrls={images}
            enableSwipeDown={true}
            onSwipeDown={() => setIsImageViewVisible(false)}
            onCancel={() => setIsImageViewVisible(false)}
            // renderIndicator={() => null}
            backgroundColor="rgba(0, 0, 0, 0.9)"
            renderHeader={() => (
              <TouchableOpacity
                onPress={() => setIsImageViewVisible(false)}
                style={{
                  position: "absolute",
                  top: 40,
                  right: 20,
                  zIndex: 100,
                  padding: 10,
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          />
        </Modal>
      </View>
    );
  };

  if (checkInStatus === "pending") {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang xử lý...</Text>
      </View>
    );
  }

  if (checkInStatus === "error") {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Đã có lỗi xảy ra. Vui lòng thử lại.</Text>
      </View>
    );
  }

  if (!resultData) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không có dữ liệu</Text>
      </View>
    );
  }

  // console.log("Valid c dâta ben ovrr", dataCheckIn);
  // console.log("RS DATA", resultData);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 bg-gray-50">
        <View className="relative pb-20">
          <Pressable
            onPress={handleGoBack}
            className="absolute top-6 left-2 flex flex-row items-center space-x-2 px-4 py-2 rounded-lg mt-4 z-10"
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
            <Text className="text-white font-medium">Quay về</Text>
          </Pressable>

          <ImageBackground
            source={{
              uri: "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg",
            }}
            className="w-full h-72"
            resizeMode="cover"
          >
            <View className="absolute inset-0 bg-black/40" />
          </ImageBackground>

          <View className="p-4 bottom-[160px]">
            <View className="mb-8">
              <Section title="Thông tin cơ bản">
                <View className="items-center mb-4">
                  <View className="flex-row items-center mt-1">
                    {/* <MapPinIcon size={28} className="text-blue-600 mr-2" /> */}
                    <Text className="text-xl font-bold text-teal-600 text-center">
                      {resultData?.visit.visitName}
                    </Text>
                  </View>
                  <View className="w-2/3 h-0.5 bg-gray-200 mt-2" />
                </View>
                <InfoRowTime
                  label="Thời gian (dự kiến)"
                  value1={resultData?.expectedStartHour}
                  value2={resultData?.expectedEndHour}
                />
                <InfoRow
                  label="Tên khách"
                  value={resultData?.visitor.visitorName}
                />
                {/* {resultData?.visitor.visitorCredentialFrontImage && (
              <ImageSection
                visitorImage={resultData?.visitor.visitorCredentialFrontImage}
              />
            )} */}
              </Section>
            </View>

            <View className="bg-gray-50 rounded-3xl mb-4">
              <Text className="text-2xl font-semibold mb-6 text-[#34495e]">
                Thông tin chi tiết
              </Text>
              <SectionDropDown
                title="Thông tin chuyến thăm"
                icon={<View className="w-6 h-6 bg-orange-500 rounded-full" />}
              >
                <InfoRow
                  label="Chuyến thăm"
                  value={resultData?.visit.visitName}
                />
                <InfoRowTime
                  label="Thời gian (dự kiến)"
                  value1={resultData?.expectedStartHour}
                  value2={resultData?.expectedEndHour}
                />
                <InfoRow
                  label="Số lượng"
                  value={resultData?.visit.visitQuantity}
                />
              </SectionDropDown>
              <SectionDropDown
                title="Thông tin khách"
                icon={<View className="w-6 h-6 bg-blue-500 rounded-full" />}
              >
                <InfoRow
                  label="Tên khách"
                  value={resultData?.visitor.visitorName}
                />
                <InfoRow
                  label="Công ty"
                  value={resultData?.visitor.companyName}
                />
                <InfoRow
                  label="Số điện thoại"
                  value={resultData?.visitor.phoneNumber}
                />
                <InfoRow
                  label="CMND/CCCD"
                  value={resultData?.visitor.credentialsCard}
                />

                {/* {resultData?.visitor.visitorCredentialFrontImage && (
              <ImageSection
                visitorImage={resultData?.visitor.visitorCredentialFrontImage}
              />
            )} */}
              </SectionDropDown>
              <SectionDropDown
                title="Thông tin thẻ"
                icon={<View className="w-6 h-6 bg-green-500 rounded-full" />}
              >
                {resultData?.cardRes.cardImage && (
                  <View className="mt-4 items-center">
                    <Text className="text-gray-500 text-sm mb-2">QR Code</Text>
                    <Image
                      source={{
                        uri: `data:image/png;base64,${resultData?.cardRes.cardImage}`,
                      }}
                      className="w-32 h-32"
                      resizeMode="contain"
                    />
                  </View>
                )}
              </SectionDropDown>

              <SectionDropDown
                title="Hình ảnh check in"
                icon={<View className="w-6 h-6 bg-yellow-500 rounded-full" />}
              >
                <ImageSliderForBodyShoe
                  response={resultData}
                  checkInData={checkInData}
                />
              </SectionDropDown>

              {checkInData?.VehicleSession?.vehicleImages?.[0]?.Image && (
                <SectionDropDown
                  title="Hình ảnh biển số xe"
                  icon={<View className="w-6 h-6 bg-pink-500 rounded-full" />}
                >
                  <View>
                    {checkInData.VehicleSession?.LicensePlate && (
                      <View className="mb-4 p-3 bg-gray-100 rounded-lg">
                        <Text className="text-gray-800 text-center text-lg font-semibold">
                          Biển số: {checkInData.VehicleSession.LicensePlate}
                        </Text>
                      </View>
                    )}

                    <View className="relative">
                      <Image
                        source={{
                          uri: checkInData.VehicleSession.vehicleImages[0]
                            .Image,
                        }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="contain"
                      />

                      <View className="absolute top-2 left-2 bg-blue-500 px-2 py-1 rounded-full flex-row items-center">
                        <MaterialIcons
                          name="directions-car"
                          size={12}
                          color="white"
                        />
                        <Text className="text-white text-xs ml-1">
                          Ảnh biển số
                        </Text>
                      </View>
                    </View>
                  </View>
                </SectionDropDown>
              )}
              {/* <TouchableOpacity
            onPress={handleNext}
            className="p-4 mb-4 bg-white rounded-full flex-row items-center justify-center"
          >
            <Text className="text-lg mr-2">Xong</Text>
            <EvilIcons name="arrow-right" size={30} color="black" />
          </TouchableOpacity> */}
            </View>
          </View>
        </View>
        <View className="absolute bottom-0 left-0 right-0 bg-white shadow-t-lg">
          <TouchableOpacity
            onPress={handleNext}
            className="m-4 bg-teal-600 rounded-xl flex-row items-center justify-center py-4"
          >
            <Text className="text-lg font-medium text-white mr-2">Xong</Text>
            <MaterialIcons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CheckInOverall;

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
  },
});
