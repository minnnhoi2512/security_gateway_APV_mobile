import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import { setVisitStaffCreate } from "@/redux/slices/visitStaffCreate.slice";
import { useDispatch, useSelector } from "react-redux";
import InputFieldCreateVisit from "@/components/UI/InputFiled/InputFieldCreateVisit";
import TimePicker from "@/components/UI/TimePicker";

interface ValidationErrors {
  [key: string]: string;
}

const CreateVisitDailyForStaffScreen1: React.FC = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const dispatch = useDispatch();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const visitCreateData = useSelector<any>(
    (s) => s.visitStaff.data
  ) as VisitStaffCreate;
  const [visitData, setVisitData] = useState<VisitStaffCreate>(visitCreateData);
  // const [testtest, setTestsetTest] = useState("");

  // console.log("CheckCheck")

  const formatTimeDisplay = (time: string) => {
    return time.slice(0, 5);
  };
  const hasError = (field: string): boolean => {
    return validationErrors[field] !== undefined;
  };

  const getErrorMessage = (field: string): string => {
    return validationErrors[field] || "";
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === "visitQuantity") {
      // console.log(value)
      setVisitData((prev) => ({
        ...prev,
        [field]: Number(value),
      }));
    } else {
      // console.log(value)
      // setTestsetTest(value);
      // console.log(testtest)
      setVisitData((prev) => ({ 
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDetailChange = (field: string, value: any) => {
    setVisitData((prev) => ({
      ...prev,
      visitDetail: [{ ...prev.visitDetail[0], [field]: value }],
    }));
  };

  useEffect(() => {
    dispatch(setVisitStaffCreate(visitData));
    // console.log(visitData);
  }, [visitData]);

  const handleTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    isStartTime: boolean
  ) => {
    const currentDate = selectedDate || new Date();
    const timeString = currentDate
      .toLocaleTimeString("en-US", { hour12: false })
      .slice(0, 5);

    if (isStartTime) {
      setShowStartPicker(false);
      handleDetailChange("expectedStartHour", timeString);
    } else {
      setShowEndPicker(false);
      handleDetailChange("expectedEndHour", timeString);
    }
  };





  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      // keyboardShouldPersistTaps="always"
      >
        <View className="bg-white rounded-3xl p-6 shadow-lg">
         
          <InputFieldCreateVisit
            label="Tiêu đề"
            value={visitData.visitName}
            onChangeText={(text) => handleInputChange("visitName", text)}
            placeholder="Nhập tiêu đề chuyến thăm"
            field="visitName"
            hasError={hasError}
            getErrorMessage={getErrorMessage}
          />

          <InputFieldCreateVisit
            label="Mô tả"
            value={visitData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            placeholder="Nhập mô tả chi tiết về chuyến thăm"
            field="description"
            multiline
            hasError={hasError}
            getErrorMessage={getErrorMessage}
          />

          {/* <InputFieldCreateVisit
            label="Số lượng"
            value={visitData.visitQuantity.toString()}
            onChangeText={(text) => handleInputChange("visitQuantity", text)}
            placeholder="Nhập số lượng chuyến thăm"
            field="visitQuantity"
            keyboardType="numeric"
            hasError={hasError}
            getErrorMessage={getErrorMessage}
          /> */}
          <View className="flex-row">
            <View className="mr-9">
              <TimePicker
                label="Thời gian bắt đầu"
                value={visitData.visitDetail[0].expectedStartHour}
                onPress={() => setShowStartPicker(true)}
                showPicker={showStartPicker}
                onTimeChange={(event, selectedDate) =>
                  handleTimeChange(event, selectedDate, true)
                }
                field="visitDetail[0].expectedStartHour"
                hasError={hasError}
                getErrorMessage={getErrorMessage}
              />
            </View>
            <View>
              <TimePicker
                label="Thời gian kết thúc"
                value={visitData.visitDetail[0].expectedEndHour}
                onPress={() => setShowEndPicker(true)}
                showPicker={showEndPicker}
                onTimeChange={(event, selectedDate) =>
                  handleTimeChange(event, selectedDate, false)
                }
                field="visitDetail[0].expectedEndHour"
                hasError={hasError}
                getErrorMessage={getErrorMessage}
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateVisitDailyForStaffScreen1;
