import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Alert,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useValidCheckInMutation } from "@/redux/services/checkin.service";
import {
  EvilIcons,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { CheckInVerWithLP } from "@/Types/checkIn.type";
import ImageViewer from "react-native-image-zoom-viewer";
import { MapPinIcon } from "lucide-react-native";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { IImageInfo } from "react-native-image-zoom-viewer/built/image-viewer.type";
import { resetValidCheckIn, setGateInId, ValidCheckInState } from "@/redux/slices/checkIn.slice";
import { useDispatch, useSelector } from "react-redux";

interface Visitor {
  visitorId: number;
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  credentialsCard: string;
  visitorCredentialFrontImage: string;
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

interface ValidCheckInData {
  VisitDetailId: string | null;
  QRCardVerification: string | null;
  ImageShoe: Array<{ imageFile: string }>;
}

interface ParsedValidData {
  VisitDetailId: string | null;
  QRCardVerification: string;

  ImageShoe: string | string[];
}

interface Response {
  visitor: Visitor;
}

interface ImageSliderProps {
  response?: Response;
  checkInData?: ValidCheckInState;
}

const ValidCheckInScreen = () => {
  const checkInDataSlice = useSelector<any>((state) => state.validCheckIn) as ValidCheckInState;
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const router = useRouter();
  const checkInString = params.dataCheckIn as string;
  // const checkInData: CheckInVerWithLP = checkInString
  //   ? JSON.parse(checkInString)
  //   : null;
  // console.log("checkInData", checkInData);
  const [
    validCheckIn,
    { data: response, error, isLoading: isLoadingValidRes },
  ] = useValidCheckInMutation();

  console.log("Check in da: ", params.dataValid);
  // console.log("Check in da res: ", response);

  useEffect(() => {
    const validateCheckIn = async () => {
      try {
        // Parse và xử lý dữ liệu đầu vào
        const dataValid = Array.isArray(params.dataValid)
          ? params.dataValid[0]
          : params.dataValid;

        // const parsedValidData = JSON.parse(dataValid) as ParsedValidData;
        // const parsedValidData = {
        //   ImageShoe: checkInDataSlice.Images?.find((img) => img.ImageType === "CheckIn_Shoe")?.Image || null,
        // };

        // let imageShoeData: { imageFile: string }[] = [];

        // if (typeof parsedValidData.ImageShoe === "string") {
        //   imageShoeData = [{ imageFile: parsedValidData.ImageShoe }];
        // } else if (Array.isArray(parsedValidData.ImageShoe)) {
        //   imageShoeData = parsedValidData.ImageShoe?.filter(
        //     (path : any): path is string => typeof path === "string" && path !== ""
        //   ).map((path : any) => ({ imageFile: path }));
        // } else if (
        //   parsedValidData.ImageShoe &&
        //   typeof parsedValidData.ImageShoe === "object"
        // ) {
        //   const imgFile = (parsedValidData.ImageShoe as any).imageFile;
        //   if (imgFile) {
        //     imageShoeData = [{ imageFile: imgFile }];
        //   }
        // }

        // if (imageShoeData.length === 0) {
        //   console.error(
        //     "No valid image data to send. Original data:",
        //     parsedValidData.ImageShoe
        //   );
        //   return;
        // }

        const validCheckInData: ValidCheckInData = {
          VisitDetailId: checkInDataSlice.VisitDetailId ? checkInDataSlice.VisitDetailId.toString() : null,
          QRCardVerification: checkInDataSlice.QrCardVerification,
          ImageShoe: checkInDataSlice.Images?.filter((img) => img.ImageType === "CheckIn_Shoe").map((img) => ({
            imageFile: img.Image || '',
          })) || [],
        };

        // Gọi API
        const result = await validCheckIn(validCheckInData);
        // console.log("API Response:", result);

        // Kiểm tra lỗi từ server
        if (result?.error) {
          const error = result.error as FetchBaseQueryError;

          if (
            error.data &&
            typeof error.data === "object" &&
            "message" in error.data
          ) {
            const message = (error.data as { message: string }).message;
            dispatch(resetValidCheckIn());
            Alert.alert("Lỗi", message, [
              {
                text: "OK",
              },
            ]);
            router.dismissTo("/(tabs)/checkin");
            return;
          } else {
            Alert.alert("Lỗi", "Đã xảy ra lỗi không xác định từ API.");
          }
        } else {
          console.log("validCheckInData", validCheckInData);
          // Alert.alert("Thành công", "Xác nhận ra thành công");
        }
      } catch (error: any) {
        console.error("Unexpected Error:", error);

        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi không xác định.";
        router.push("/(tabs)/checkin");
        Alert.alert("Lỗi", errorMessage, [
          {
            text: "OK",
          },
        ]);
        return;
      }
    };

    validateCheckIn();
  }, []);

  const handleNext = () => {
    console.log(checkInDataSlice);
    router.push({
      pathname: "/check-in/CheckInOverall",
      // params: {
      //   dataCheckIn: JSON.stringify(checkInDataSlice),
      // },
    });
  };
  
  //  console.log("Response valid: ", response);

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
        <View className="w-9 h-9 bg-[#f6ddcc] rounded-full items-center justify-center mr-3">
          <Ionicons name="calendar" size={24} color="#d35400" />
        </View>
        <Text className="text-2xl font-semibold text-[#d35400]">{title}</Text>
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
            {imageUris.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedImageIndex(index);
                  setIsImageViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: uri }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 10,
                    marginVertical: 10,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}

            <Modal visible={isImageViewerVisible} transparent={true}>
              <ImageViewer
                imageUrls={imageUris.map((uri) => ({ url: uri }))}
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

  const ImageSection: React.FC<ImageSectionProps> = ({ visitorImage }) => {
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);

    const images = [
      {
        url: `data:image/png;base64,${visitorImage}`,
        props: {
          source: {
            uri: `data:image/png;base64,${visitorImage}`,
          },
        },
      },
    ];

    return (
      <View className="mt-4 items-center">
        <Text className="text-gray-500 text-sm mb-2">Ảnh giấy tờ</Text>

        <TouchableOpacity
          onPress={() => setIsImageViewVisible(true)}
          className="w-32 h-32"
        >
          <Image
            source={{
              uri: `data:image/png;base64,${visitorImage}`,
            }}
            className="w-46 h-32"
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

  // const ImageSlider: React.FC<ImageSliderProps> = ({
  //   response,
  //   checkInData,
  // }) => {
  //   const [isImageViewVisible, setIsImageViewVisible] =
  //     useState<boolean>(false);
  //   const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  //   const images = useMemo<IImageInfo[]>(() => {
  //     const allImages: IImageInfo[] = [];
  //     const tempLabels: string[] = [];
  //     if (response?.visitor.visitorCredentialFrontImage) {
  //       allImages.push({
  //         url: `data:image/png;base64,${response.visitor.visitorCredentialFrontImage}`,
  //       });
  //       tempLabels.push('Ảnh CCCD');
  //     }

  //     // checkInData?.Images?.forEach((img) => {
  //     //   if (img.Image) {
  //     //     allImages.push({
  //     //       url: img.Image,
  //     //     });
  //     //   }
  //     // });
  //     checkInData?.Images?.forEach((img) => {
  //       if (img.Image) {
  //         allImages.push({
  //           url: img.Image,
  //         });

  //         let label = '';
  //         switch(img.ImageType) {
  //           case 'CheckIn_Shoe':
  //             label = 'Ảnh giày';
  //             break;
  //           case 'CheckIn_Body':
  //             label = 'Ảnh toàn thân';
  //             break;
  //           default:
  //             label = 'Ảnh khác';
  //         }
  //         tempLabels.push(label);
  //       }
  //     });

  //     if (checkInData?.VehicleSession?.vehicleImages?.[0]?.Image) {
  //       allImages.push({
  //         url: checkInData.VehicleSession.vehicleImages[0].Image,
  //       });
  //       tempLabels.push('Ảnh xe');
  //     }


  //     return allImages;
  //   }, [response, checkInData]);

  //   return (
  //     <View className="mt-4 w-full">
  //       <ScrollView
  //         horizontal={true}
  //         showsHorizontalScrollIndicator={false}
  //         contentContainerStyle={{
  //           paddingHorizontal: 16,
  //         }}
  //       >
  //         {images.map((image, index) => (
  //           <TouchableOpacity
  //             key={index}
  //             onPress={() => {
  //               setCurrentImageIndex(index);
  //               setIsImageViewVisible(true);
  //             }}
  //             className="mr-1"
  //             style={{
  //               width: 200,
  //               aspectRatio: 4 / 3,
  //             }}
  //           >
  //             <Image
  //               source={{ uri: image.url }}
  //               style={{
  //                 width: "100%",
  //                 height: "90%",
  //                 borderRadius: 8,
  //               }}
  //               resizeMode="cover"
  //             />
  //           </TouchableOpacity>
  //         ))}
  //       </ScrollView>

  //       <Modal
  //         visible={isImageViewVisible}
  //         transparent={true}
  //         onRequestClose={() => setIsImageViewVisible(false)}
  //       >
  //         <ImageViewer
  //           imageUrls={images}
  //           enableSwipeDown={true}
  //           onSwipeDown={() => setIsImageViewVisible(false)}
  //           onCancel={() => setIsImageViewVisible(false)}
  //           index={currentImageIndex}
  //           backgroundColor="rgba(0, 0, 0, 0.9)"
  //           renderHeader={() => (
  //             <TouchableOpacity
  //               onPress={() => setIsImageViewVisible(false)}
  //               style={{
  //                 position: "absolute",
  //                 top: 40,
  //                 right: 20,
  //                 zIndex: 100,
  //                 padding: 10,
  //               }}
  //             >
  //               <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
  //             </TouchableOpacity>
  //           )}
  //           renderIndicator={(currentIndex?: number, allSize?: number) => {
  //             if (
  //               typeof currentIndex === "number" &&
  //               typeof allSize === "number"
  //             ) {
  //               return (
  //                 <View
  //                   style={{
  //                     position: "absolute",
  //                     top: 40,
  //                     left: 20,
  //                     zIndex: 100,
  //                   }}
  //                 >
  //                   <Text style={{ color: "white" }}>
  //                     {`${currentIndex + 1}/${allSize}`}
  //                   </Text>
  //                 </View>
  //               );
  //             }
  //             return <View />;
  //           }}
  //         />
  //       </Modal>
  //     </View>
  //   );
  // };


  const ImageSlider: React.FC<ImageSliderProps> = ({
    response,
    checkInData,
  }) => {
    const [isImageViewVisible, setIsImageViewVisible] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const { images, labels } = useMemo(() => {
      const tempImages: IImageInfo[] = [];
      const tempLabels: string[] = [];

      if (response?.visitor.visitorCredentialFrontImage) {
        tempImages.push({
          url: `data:image/png;base64,${response.visitor.visitorCredentialFrontImage}`,
        });
        tempLabels.push('Ảnh CCCD');
      }
      console.log("checkInData", checkInData);
      checkInData?.Images?.forEach((img) => {
        if (img.Image) {
          tempImages.push({
            url: img.Image,
          });

          let label = '';
          switch (img.ImageType) {
            case 'CheckIn_Shoe':
              label = 'Ảnh giày';
              break;
            case 'CheckIn_Body':
              label = 'Ảnh toàn thân';
              break;
            default:
              label = 'Ảnh khác';
          }
          tempLabels.push(label);
        }
      });

      if (checkInData?.VehicleSession?.vehicleImages?.[0]?.Image) {
        tempImages.push({
          url: checkInData.VehicleSession.vehicleImages[0].Image,
        });
        tempLabels.push('Ảnh xe');
      }

      return {
        images: tempImages,
        labels: tempLabels
      };
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
              <View style={{ position: 'relative', width: '100%', height: '90%' }}>
                <Image
                  source={{ uri: image.url }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>{labels[index]}</Text>
                </View>
              </View>
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
              <View style={{
                position: 'absolute',
                top: 40,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                zIndex: 100,
              }}>
                <Text style={{ color: "white" }}>
                  {`${currentImageIndex + 1}/${images.length} - ${labels[currentImageIndex]}`}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsImageViewVisible(false)}
                  style={{
                    padding: 10,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            renderIndicator={(currentIndex?: number, allSize?: number) => (
              <View />
            )}
          />
        </Modal>
      </View>
    );
  };

  const ImageSliderForBodyShoe: React.FC<ImageSliderProps> = ({

    checkInData,
  }) => {
    const [isImageViewVisible, setIsImageViewVisible] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const { images, labels } = useMemo(() => {
      const tempImages: IImageInfo[] = [];
      const tempLabels: string[] = [];

      checkInData?.Images?.forEach((img) => {
        if (img.Image) {
          tempImages.push({
            url: img.Image,
          });

          let label = '';
          switch (img.ImageType) {
            case 'CheckIn_Shoe':
              label = 'Ảnh giày';
              break;
            case 'CheckIn_Body':
              label = 'Ảnh toàn thân';
              break;
            default:
              label = 'Ảnh khác';
          }
          tempLabels.push(label);
        }
      });


      return {
        images: tempImages,
        labels: tempLabels
      };
    }, [checkInData]);

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
              <View style={{ position: 'relative', width: '100%', height: '90%' }}>
                <Image
                  source={{ uri: image.url }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>{labels[index]}</Text>
                </View>
              </View>
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
              <View style={{
                position: 'absolute',
                top: 40,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                zIndex: 100,
              }}>
                <Text style={{ color: "white" }}>
                  {`${currentImageIndex + 1}/${images.length} - ${labels[currentImageIndex]}`}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsImageViewVisible(false)}
                  style={{
                    padding: 10,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            renderIndicator={(currentIndex?: number, allSize?: number) => (
              <View />
            )}
          />
        </Modal>
      </View>
    );
  };

  if (isLoadingValidRes) {
    return (
      <View className="flex-1 items-center justify-center bg-backgroundApp">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Đang xử lý...</Text>
      </View>
    );
  }
  const handleGoBack = () => {
    dispatch(resetValidCheckIn());
    router.dismissTo("/(tabs)/checkin");
  };

  return (
    <View className="flex-1 bg-gray-50">
      
    </View>
  );
};

export default ValidCheckInScreen;
