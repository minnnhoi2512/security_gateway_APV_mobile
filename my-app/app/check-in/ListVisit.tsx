import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useGetVisitByCredentialCardQuery } from "@/redux/services/visit.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isApiError } from "@/redux/Types/ApiError";
import { useDispatch, useSelector } from "react-redux";
import { resetValidCheckIn, setValidCheckIn, setVisitDetailId, ValidCheckInState } from "@/redux/slices/checkIn.slice";
import { RootState } from "@/redux/store/store";
import { useToast } from "@/components/Toast/ToastContext";

interface Visit {
  visitDetailId: number;
  expectedStartHour: string;
  expectedEndHour: string;
  status: boolean;
  visitor: {
    visitorId: number;
    visitorName: string;
    companyName: string;
    phoneNumber: string;
    credentialsCard: string;
    visitorCredentialImage: string;
    status: string;
  };
  visit: {
    visitId: number;
    visitName: string;
    visitQuantity: number;
    createByname: string | null;
    scheduleTypeName: string;
  };
}

const ListVisit: React.FC = () => {
  // const { VerifiedId } = useLocalSearchParams<{
  //   VerifiedId: string;
  // }>();
  // const { type: verifiedType } = useLocalSearchParams<{
  //   type: string;
  // }>();
  // const { isVehicle: isVehicleParam } = useLocalSearchParams<{
  //   isVehicle: string;
  // }>();
  const dispatch = useDispatch();
  const checkInDataSlice = useSelector<any>((state) => state.validCheckIn) as ValidCheckInState;
  const { showToast } = useToast();

  // console.log("checkInDataSlice", checkInDataSlice);
  const visitNotFoundShown = useRef(false);

  const [checkInData, setCheckInData] = useState<ValidCheckInState>(checkInDataSlice);

  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: visitOfUser,
    isLoading: isLoadingVisit,
    error: isError,
    isFetching: isFetchingVisit,
    refetch
  } = useGetVisitByCredentialCardQuery(
    {
      VerifiedId: checkInDataSlice.type === "CredentialCard" ? checkInDataSlice.CredentialCard : checkInDataSlice.QrCardVerification,
      verifiedType: checkInDataSlice.type
    },
    {
      skip: checkInDataSlice.CredentialCard === null && checkInDataSlice.QrCardVerification === null,
    }
  );

  useEffect(() => {
    // console.log("checkInData-listVisit", checkInData);
  }, [checkInData, checkInDataSlice]);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const isTimeToStart = (expectedStartHour: string): boolean => {
    const now = new Date();
    const [hours, minutes] = expectedStartHour.split(":").map(Number);
    const expectedTime = new Date();
    expectedTime.setHours(hours, minutes, 0);
    return now >= expectedTime;
  };

  const handlePress = (visitDetailId: number) => {
    if (checkInDataSlice.type == "QRCardVerified" && checkInDataSlice.isVehicle == true) {
      dispatch(setVisitDetailId(visitDetailId));
      console.log("11", checkInDataSlice)
      router.push({
        pathname: "/check-in/CheckLicensePlate",
        // params: {  visitDetailId, VerifiedId, 

        //  },
      });
      // router.push({
      //   pathname: "/check-in/CheckLicensePlateCard",
      //   // params: {  visitDetailId, VerifiedId, verifiedType },
      // });

    }
    if (checkInDataSlice.type == "CredentialCard" && checkInDataSlice.isVehicle == true) {
      dispatch(setVisitDetailId(visitDetailId));
      router.push({
        pathname: "/check-in/CheckLicensePlate",
        // params: {  visitDetailId, VerifiedId, 

        //  },
      });
      console.log("22")
    }
    if (checkInDataSlice.type == "QRCardVerified" && checkInDataSlice.isVehicle == false) {
      console.log("33", checkInDataSlice)
      dispatch(setVisitDetailId(visitDetailId));
      router.push({
        pathname: "/check-in/UserDetail",
        // params: { visitDetailId, VerifiedId, verifiedType },
      });

    }
    if (checkInDataSlice.type == "CredentialCard" && checkInDataSlice.isVehicle == false) {

      console.log("44", checkInDataSlice);
      dispatch(setVisitDetailId(visitDetailId));
      router.push({
        pathname: "/check-in/UserDetail",
        // params: { visitDetailId, VerifiedId, verifiedType },
      });

    }
  };

  useEffect(() => {
    if (visitOfUser && visitOfUser.length === 0) {
      refetch();
    }
  }, [visitOfUser, refetch]);
  const handleBackPress = () => {
    router.back();
  };

  const handleVisitNotFound = () => {
    visitNotFoundShown.current = true;

    Alert.alert(
      "Không tìm thấy dữ liệu",
      isApiError(isError) ? isError.data.message :
      "Lỗi trong quá trình quét mã. Vui lòng thử lại hoặc quét lại mã.",
      [
        {
          text: "Quét lại",
          onPress: () => {
            router.back();
            // resetState();
            visitNotFoundShown.current = false;
          },
        },
        {
          text: "Ok",
          onPress: () => {
            router.navigate({
              pathname: "/(tabs)",
            });
            // resetState();
            visitNotFoundShown.current = false;
          },
        },
      ]
    );
  };
  useEffect(() => {
    console.log(isError )
    if (checkInDataSlice.CredentialCard !== null && checkInDataSlice.QrCardVerification !== null && isError) {
      dispatch(resetValidCheckIn());
      handleVisitNotFound();
    }
  }, [isError]);
  // useEffect(() => {
  //   if (isError && !visitNotFoundShown.current) {
  //     handleVisitNotFound();
  //     visitNotFoundShown.current = true;
  //     // visitNotFoundShown.current = false;
  //     // router.navigate({
  //     //   pathname: "/(tabs)/checkin",
  //     //   params: {
  //     //     error: isApiError(isError) ? isError.data.message : "Không tìm thấy dữ liệu cho ID này.",
  //     //   },
  //     // });
  //   }
  //   // else if (
  //   //   !isLoadingVisit &&
  //   //   !isFetchingVisit &&
  //   //   !visitNotFoundShown.current
  //   // ) {
  //   //   visitNotFoundShown.current = true;
  //   //   showToast("Không tìm thấy thông tin chuyến thăm", "error");
  //   // }
  //   // if (isError !== undefined && isError !== null) {
  //   //   console.log(isError);
  //   //   if (isApiError(isError) && isError.status === 400 && (isError.data.code === "Error.Visit" || isError.data.code === "Error.NotfoundVisitor")) {
  //   //     handleVisitNotFound();
  //   //   }
  //   // }
  // }, []);
  const renderVisit = ({ item }: { item: Visit }) => {
    const canStart = isTimeToStart(item.expectedStartHour);

    return (
      <TouchableOpacity
        onPress={() => handlePress(item.visitDetailId)}
        disabled={!canStart}
        className={`bg-white dark:bg-gray-800 p-5 my-2 rounded-xl shadow-lg border 
          ${canStart
            ? "border-gray-100 dark:border-gray-700"
            : "border-gray-200 dark:border-gray-600 opacity-75"
          }`}
      >
        <View className="border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {item.visit.visitName}
          </Text>
          {!canStart && (
            <View className="bg-yellow-100 dark:bg-yellow-900 rounded-full px-3 py-1 self-start">
              <Text className="text-sm text-yellow-800 dark:text-yellow-200">
                Chưa đến giờ bắt đầu
              </Text>
            </View>
          )}
        </View>

        <View className="space-y-2">
          <View className="flex-row items-center">
            <MaterialIcons
              name="person"
              size={20}
              className="text-gray-500 dark:text-gray-400"
            />
            <Text className="text-gray-700 dark:text-gray-300 ml-2">
              <Text className="font-medium">Khách thăm:</Text>{" "}
              {item.visitor.visitorName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons
              name="business"
              size={20}
              className="text-gray-500 dark:text-gray-400"
            />
            <Text className="text-gray-700 dark:text-gray-300 ml-2">
              <Text className="font-medium">Công ty:</Text>{" "}
              {item.visitor.companyName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons
              name="phone"
              size={20}
              className="text-gray-500 dark:text-gray-400"
            />
            <Text className="text-gray-700 dark:text-gray-300 ml-2">
              <Text className="font-medium">SĐT:</Text>{" "}
              {item.visitor.phoneNumber}
            </Text>
          </View>

          <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Bắt đầu
                </Text>
                <Text
                  className={`font-medium ${canStart
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-yellow-600 dark:text-yellow-400"
                    }`}
                >
                  {item.expectedStartHour}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Kết thúc
                </Text>
                <Text className="text-gray-700 dark:text-gray-300 font-medium">
                  {item.expectedEndHour}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 shadow-sm">
        <Pressable
          onPress={handleBackPress}
          className="flex-row items-center space-x-2 px-4 py-4 mt-11"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            className="text-gray-600 dark:text-gray-300"
          />
          <Text className="text-gray-600 dark:text-gray-300 font-medium text-lg">
            Quay về
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 px-4 pt-4">
        {isLoadingVisit || isFetchingVisit ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="mt-2 text-gray-600 dark:text-gray-400">
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : isError ? (
          <View className="flex-1 justify-center items-center">
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text className="mt-2 text-red-600 text-center">
              {isApiError(isError) ? isError.data.message : "Đã có lỗi xảy ra. Vui lòng thử lại sau."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={visitOfUser}
            keyExtractor={(item) => item.visitDetailId.toString()}
            renderItem={renderVisit}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-10">
                <MaterialIcons
                  name="info-outline"
                  size={48}
                  className="text-gray-400"
                />
                <Text className="text-center mt-4 text-lg text-gray-500 dark:text-gray-400">
                  Không có chuyến thăm nào.
                </Text>
                <TouchableOpacity
                  onPress={handleRefresh}
                  className="mt-4 bg-blue-500 px-6 py-2 rounded-full"
                >
                  <Text className="text-white font-medium">Tải lại</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}

            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={8}
            windowSize={5}
          />
        )}
      </View>
    </View>
  );
};

export default ListVisit;
