import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  Platform,
  BackHandler,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Send,
} from "lucide-react-native";
import { useCreateVisitMutation } from "@/redux/services/visit.service";
import { useToast } from "@/components/Toast/ToastContext";
import { useGetStaffByPhoneQuery } from "@/redux/services/user.service";
import { FontAwesome5 } from "@expo/vector-icons";

const FormCreate = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { visitorId } = useLocalSearchParams<{ visitorId: string }>();
  const visitorIdNumber = isNaN(Number(visitorId)) ? 0 : Number(visitorId);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [createVisit, { isLoading }] = useCreateVisitMutation();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const { showToast } = useToast();

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatTimeDisplay = (time: string) => {
    return time.slice(0, 5);
  };

  const [visitData, setVisitData] = useState({
    visitName: "",
    visitQuantity: 1,
    expectedStartTime: new Date().toISOString().split("T")[0],
    expectedEndTime: new Date().toISOString().split("T")[0],
    createById: 0,
    description: "",
    responsiblePersonId: 0,
    visitDetail: [
      {
        expectedStartHour: getCurrentTime(),
        expectedEndHour: "12:00:00",
        visitorId: visitorIdNumber,
      },
    ],
  });

  const { data: staffByPhone } = useGetStaffByPhoneQuery(searchPhoneNumber, {
    skip: searchPhoneNumber.length === 0,
  });

  useEffect(() => {
    const cleanup = () => {
      // Cleanup any active camera or surface resources
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', () => true);
      }
    };
  
    return cleanup;
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          const numericUserId = Number(storedUserId);
          setUserId(storedUserId);
          setVisitData((prevState) => ({
            ...prevState,
            createById: numericUserId,
          }));
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (staffByPhone && staffByPhone.userId) {
      setVisitData((prevState) => ({
        ...prevState,
        responsiblePersonId: staffByPhone.userId,
      }));
    }
  }, [staffByPhone]);

  const handleInputChange = (field: string, value: any) => {
    setVisitData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleDetailChange = (field: string, value: any) => {
    setVisitData((prevState) => ({
      ...prevState,
      visitDetail: [{ ...prevState.visitDetail[0], [field]: value }],
    }));
  };

  const handleTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    isStartTime: boolean
  ) => {
    const currentDate = selectedDate || new Date();
    const timeString = currentDate
      .toLocaleTimeString("en-US", { hour12: false })
      .slice(0, 8);

    if (isStartTime) {
      setShowStartPicker(false);
      handleDetailChange("expectedStartHour", timeString);
    } else {
      setShowEndPicker(false);
      handleDetailChange("expectedEndHour", timeString);
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...visitData,
        visitQuantity: Number(visitData.visitQuantity),
        expectedStartTime: `${visitData.expectedStartTime}T${visitData.visitDetail[0].expectedStartHour}`,
        expectedEndTime: `${visitData.expectedEndTime}T${visitData.visitDetail[0].expectedEndHour}`,
      };

      const result = await createVisit(submitData).unwrap();
      showToast("Bạn vừa tạo lịch ghé thăm thành công!", "success");
      Alert.alert("Thành công", "Tạo lịch ghé thăm thành công!", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";

      showToast("Đã có lỗi xảy ra", "error");
      Alert.alert("Đã có lỗi xảy ra", errorMessage);
    }
  };

  const clearValidationError = (field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  useEffect(() => {
     
    if (staffByPhone) {
      setSearchPhoneNumber(`${staffByPhone.fullName}`);
    }
  }, [staffByPhone]);
  
  useEffect(() => {
 
    if (!searchPhoneNumber.trim()) {
      setVisitData((prevState) => ({
        ...prevState,
        responsiblePersonId: 0,
      }));
    }
  }, [searchPhoneNumber]);
  
  useEffect(() => {
 
    if (staffByPhone && staffByPhone.userId) {
      setVisitData((prevState) => ({
        ...prevState,
        responsiblePersonId: staffByPhone.userId,
      }));
    }
  }, [staffByPhone]);

  const hasError = (field: string) => {
    return validationErrors[field] !== undefined;
  };

  const getErrorMessage = (field: string) => {
    return validationErrors[field];
  };
  const handleBackPress = () => {
    router.push({
      pathname: "/(tabs)",
    });
  };

  console.log("Crea5 da: ", visitData);
  

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-blue-50 to-white">
      <View className="px-4 pt-12 pb-6">
        <Pressable
          onPress={handleBackPress}
          className="flex-row items-center mb-6 space-x-2"
        >
          <ChevronLeft size={24} color="#4A5568" />
          <Text className="text-gray-600 text-base font-semibold">Quay về</Text>
        </Pressable>

        <View className="bg-white rounded-2xl shadow-lg p-6">
          <Text className="text-3xl font-bold mb-6 text-center text-colorTitleHeader">
            Tạo mới lịch hẹn
          </Text>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <FileText size={20} color="#4A5568" className="mr-2" />
              <Text className="text-sm font-semibold text-gray-700">
                Tiêu đề
              </Text>
            </View>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              value={visitData.visitName}
              onChangeText={(text) => handleInputChange("visitName", text)}
              placeholder="Nhập tiêu đề chuyến thăm"
            />
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2 ml-1">
     
              <FontAwesome5 name="sticky-note" size={18} color="#4A5568" />
              <Text className="text-sm font-semibold text-gray-700"> Mô tả</Text>
            </View>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 min-h-[100px]"
              value={visitData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Nhập mô tả chuyến thăm"
              multiline
              numberOfLines={4}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800  mb-2">
              Chọn nhân viên theo số điện thoại
            </Text>
            <TextInput
              className={`bg-gray-50 border ${
                hasError("searchPhoneNumber")
                  ? "border-red-500"
                  : "border-gray-200"
              } rounded-lg px-4 py-3 text-backgroundApp`}
              value={searchPhoneNumber}
              onChangeText={(text) => {
                setSearchPhoneNumber(text);
                clearValidationError("searchPhoneNumber");
              }}
              placeholder="Nhập số điện thoại"
            />
            {hasError("searchPhoneNumber") && (
              <Text className="text-red-500 text-sm mt-1">
                {getErrorMessage("searchPhoneNumber")}
              </Text>
            )}
          </View>

          {/* {isLoadingStaffByPhone && (
            <Text className="text-white mt-2">Đang tra cứu...</Text>
          )}
          {isErrorStaffByPhone && (
            <Text className="text-red-500">Không tìm thấy nhân viên</Text>
          )} */}
          {/* {staffByPhone && (
            <View className="bg-gray-100 rounded-lg p-4 mt-4 mb-4">
              <Text className="text-backgroundApp">
                Nhân viên: {staffByPhone.fullName}
              </Text>
            </View>
          )} */}
          {/* <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Chọn nhân viên theo số điện thoại
            </Text>
            <TextInput
              className={`bg-gray-50 border ${
                hasError("searchPhoneNumber")
                  ? "border-red-500"
                  : "border-gray-200"
              } rounded-lg px-4 py-3 text-backgroundApp`}
              value={searchPhoneNumber}
              onChangeText={(text) => {
                setSearchPhoneNumber(text);
                clearValidationError("searchPhoneNumber");
              }}
              placeholder="Nhập số điện thoại"
            />
            {hasError("searchPhoneNumber") && (
              <Text className="text-red-500 text-sm mt-1">
                {getErrorMessage("searchPhoneNumber")}
              </Text>
            )}
          </View>

          {isLoadingStaffByPhone && (
            <Text className="text-white mt-2">Đang tra cứu...</Text>
          )}
          {isErrorStaffByPhone && (
            <Text className="text-red-500">Không tìm thấy nhân viên</Text>
          )}
          {staffByPhone && (
            <View className="bg-gray-100 rounded-lg p-4 mt-4 mb-4">
              <Text className="text-backgroundApp">
                Nhân viên: {staffByPhone.fullName}
              </Text>
             
            </View>
          )} */}

          <View className="flex-row gap-2">
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Clock size={20} color="#4A5568" className="mr-2" />
                <Text className="text-sm font-semibold text-gray-700">
                  Bắt đầu
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center"
              >
                <Calendar size={20} color="#4A5568" className="mr-2" />
                <Text className="text-gray-800">
                  {/* {visitData.visitDetail[0].expectedStartHour} */}
                  {formatTimeDisplay(
                    visitData.visitDetail[0].expectedStartHour
                  )}
                </Text>
              </TouchableOpacity>
              {/* {showStartPicker && (
              <DateTimePicker
                value={
                  new Date(
                    `2000-01-01T${visitData.visitDetail[0].expectedStartHour}`
                  )
                }
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) =>
                  handleTimeChange(event, selectedDate, true)
                }
              />
            )} */}
            </View>

            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Clock size={20} color="#4A5568" className="mr-2" />
                <Text className="text-sm font-semibold text-gray-700">
                  Kết thúc
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center"
              >
                <Calendar size={20} color="#4A5568" className="mr-2" />
                <Text className="text-gray-800">
                  {/* {visitData.visitDetail[0].expectedEndHour} */}
                  {formatTimeDisplay(visitData.visitDetail[0].expectedEndHour)}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={
                    new Date(
                      `2000-01-01T${visitData.visitDetail[0].expectedEndHour}`
                    )
                  }
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) =>
                    handleTimeChange(event, selectedDate, false)
                  }
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="bg-backgroundApp rounded-lg py-4 flex-row justify-center items-center"
          >
            <Send size={24} color="white" className="mr-2" />
            <Text className="text-white text-base font-bold">
              {isLoading ? "Đang xử lý..." : "Tạo mới"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default FormCreate;
