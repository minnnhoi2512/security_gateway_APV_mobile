import { useCreateVisitMutation } from "@/redux/services/visit.service";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const FormCreate = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const [createVisit, { isLoading }] = useCreateVisitMutation();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
  const [visitData, setVisitData] = useState({
    visitName: "",
    visitQuantity: 1,
    expectedStartTime: new Date().toISOString().split("T")[0],
    expectedEndTime: new Date().toISOString().split("T")[0],
    createById: 0,
    description: "",
    // scheduleId: 6,
    visitDetail: [
      {
        expectedStartHour: getCurrentTime(),
        expectedEndHour: "17:00:00",
        visitorId: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          const numericUserId = Number(storedUserId);
          setUserId(storedUserId);
          console.log("User ID from AsyncStorage:", storedUserId);
          setVisitData((prevState) => ({
            ...prevState,
            createById: numericUserId,
          }));
        } else {
          console.log("No userId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

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
      // Prepare the data for API submission
      const submitData = {
        ...visitData,
        visitQuantity: Number(visitData.visitQuantity),
        // scheduleId: Number(visitData.scheduleId),
        expectedStartTime: `${visitData.expectedStartTime}T${visitData.visitDetail[0].expectedStartHour}`,
        expectedEndTime: `${visitData.expectedEndTime}T${visitData.visitDetail[0].expectedEndHour}`,
      };

      const result = await createVisit(submitData).unwrap();
      Alert.alert("Thành công", "Tạo lịch ghé thăm thành công!", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)/");
          },
        },
      ]);
      console.log("Visit created:", result);
    } catch (error) {
      Alert.alert("Error", "Failed to create visit");
      console.error("Failed to create visit:", error);
    }
  };

  const handleBackPress = () => {
    router.push({
      pathname: "/(tabs)/",
    });
  };
  console.log("Data create visit: ", visitData);

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <Pressable
        onPress={handleBackPress}
        className="flex flex-row items-center mt-11 space-x-2 px-4 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
      >
        <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
        <Text className="text-gray-600 font-medium">Quay về</Text>
      </Pressable>
      <View className="p-6">
        <Text className="text-3xl font-bold mb-6 text-backgroundApp text-center">
          Tạo mới lịch hẹn
        </Text>

        <View className="bg-backgroundApp rounded-xl shadow-lg p-6 mb-6">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Tiêu đề
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-white"
              value={visitData.visitName}
              onChangeText={(text) => handleInputChange("visitName", text)}
              placeholder="Enter visit name"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Mô tả
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-white"
              value={visitData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Thời gian bắt đầu
            </Text>
            <TouchableOpacity className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-gray-700">
                {visitData.visitDetail[0].expectedStartHour}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
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
            )}
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Thời gian kết thúc
            </Text>
            <TouchableOpacity
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              onPress={() => setShowEndPicker(true)}
            >
              <Text className="text-gray-700">
                {visitData.visitDetail[0].expectedEndHour}
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

          <TouchableOpacity
            className="bg-buttonColors rounded-lg py-4 px-6 shadow-md"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? "Đang xử lý..." : "Tạo mới"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default FormCreate;
