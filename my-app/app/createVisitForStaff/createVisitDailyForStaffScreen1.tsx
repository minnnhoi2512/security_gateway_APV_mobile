import { View, Text, SafeAreaView, ScrollView, Pressable, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import DateTimePicker from "@react-native-community/datetimepicker";
import VisitStaffCreate from '@/Types/VisitStaffCreate.Type';
import { setVisitStaffCreate } from '@/redux/slices/visitStaffCreate.slice';
import { useDispatch, useSelector } from 'react-redux';

const CreateVisitDailyForStaffScreen1 = () => {
    const [validationErrors, setValidationErrors] = useState<{
        [key: string]: string;
    }>({});
    const dispatch = useDispatch();
    const hasError = (field: string) => {
        return validationErrors[field] !== undefined;
    };
    
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    };
    const visitCreateData = useSelector<any>(s => s.visitStaff.data) as VisitStaffCreate
    const [visitData, setVisitData] = useState<VisitStaffCreate>(useSelector<any>(s => s.visitStaff.data) as VisitStaffCreate);
 
    const handleInputChange = (field: string, value: any) => {
        if(field !== "visitQuantity"){
            setVisitData((prevState) => ({
                ...prevState,
                [field]: value,
            }));      
        }
        else{
            setVisitData((prevState) => ({
                ...prevState,
                [field]: Number(value),
            }));  
        }
    };
    useEffect(() => {
        dispatch(setVisitStaffCreate(visitData))
    },[visitData])
    const handleDetailChange = (field: string, value: any) => {
        setVisitData((prevState) => ({
          ...prevState,
          visitDetail: [{ ...prevState.visitDetail[0], [field]: value }],
        }));
      };
    const getErrorMessage = (field: string) => {
        return validationErrors[field];
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


    return (
            <ScrollView className="bg-gradient-to-b from-blue-50 to-white">
                <View className='px-6'>
                    <View className=" mb-6 ">
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-black mb-2">
                                Tiêu đề
                            </Text>
                            <TextInput
                                className={`bg-gray-50 border ${hasError("visitName") ? "border-red-500" : "border-gray-200"
                                    } rounded-lg px-4 py-4 text-black`}
                                value={visitCreateData.visitName}
                                onChangeText={(text) => handleInputChange("visitName", text)}
                                placeholderTextColor="grey"
                                placeholder="Nhập tiêu đề chuyến thăm"
                                
                            />
                            {hasError("visitName") && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {getErrorMessage("visitName")}
                                </Text>
                            )}
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-black mb-2">Mô tả</Text>
                            <TextInput
                                className={`bg-gray-50 border ${hasError("description") ? "border-red-500" : "border-gray-200"
                                    } rounded-lg px-4 py-10 text-backgroundApp h-50`}
                                value={visitData.description}
                                onChangeText={(text) => handleInputChange("description", text)}
                                placeholderTextColor="grey"
                                placeholder="Nhập mô tả"
                                multiline
                                numberOfLines={4}
                            />
                            {hasError("description") && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {getErrorMessage("description")}
                                </Text>
                            )}
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-black mb-2">
                                Số lượng
                            </Text>
                            <TextInput
                                className={`bg-gray-50 border ${hasError("visitName") ? "border-red-500" : "border-gray-200"
                                    } rounded-lg px-4 py-4 text-black`}
                                value={visitData.visitQuantity.toString()}
                                onChangeText={(text) => handleInputChange("visitQuantity", text)}
                                placeholderTextColor="grey"

                                placeholder="Nhập tiêu đề chuyến thăm"
                                
                            />
                            {hasError("visitName") && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {getErrorMessage("visitName")}
                                </Text>
                            )}
                        </View>            
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-black mb-2">
                                Thời gian bắt đầu
                            </Text>
                            <TouchableOpacity className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Text className="text-gray-700">
                                    {visitData.visitDetail[0].expectedStartHour}
                                </Text>
                            </TouchableOpacity>
                            {hasError("visitDetail[0].expectedStartHour") && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {getErrorMessage("visitDetail[0].expectedStartHour")}
                                </Text>
                            )}
                            {showStartPicker && (
                                <DateTimePicker
                                    value={
                                        new Date()
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
                            <Text className="text-sm font-semibold text-black mb-2">
                                Thời gian kết thúc
                            </Text>
                            <TouchableOpacity
                                className={`bg-gray-50 border ${hasError("visitDetail[0].expectedEndHour")
                                        ? "border-red-500"
                                        : "border-gray-200"
                                    } rounded-lg px-4 py-3`}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <Text className="text-gray-700">
                                    {visitData.visitDetail[0].expectedEndHour}
                                </Text>
                            </TouchableOpacity>
                            {hasError("visitDetail[0].expectedEndHour") && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {getErrorMessage("visitDetail[0].expectedEndHour")}
                                </Text>
                            )}
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

                        {/* <View className="mb-4">
            <Text className="text-sm font-semibold text-white mb-2">
              Chọn nhân viên phụ trách
            </Text>
            <View
              className={`border ${
                hasError("responsiblePersonId")
                  ? "border-red-500"
                  : "border-gray-200"
              } rounded-lg`}
            >
              <Picker
                selectedValue={selectedStaffId}
                onValueChange={(itemValue) => handleStaffSelect(itemValue)}
                style={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: 8,
                  padding: 10,
                  color: "#333",
                }}
              >
                <Picker.Item label="Chọn nhân viên" value={null} />
                {staffList?.map((staff: Staff) => (
                  <Picker.Item
                    key={staff.userId}
                    label={staff.userName}
                    value={staff.userId}
                  />
                ))}
              </Picker>
            </View>
            {hasError("responsiblePersonId") && (
              <Text className="text-red-500 text-sm mt-1">
                {getErrorMessage("responsiblePersonId")}
              </Text>
            )}
          </View> */}
                    </View>
                </View>
            </ScrollView>
    )
}

export default CreateVisitDailyForStaffScreen1