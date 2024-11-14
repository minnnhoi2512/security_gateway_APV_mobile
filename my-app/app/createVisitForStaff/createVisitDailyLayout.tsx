import { View, Text, SafeAreaView, Pressable } from 'react-native'
import React from 'react'
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { MaterialIcons } from '@expo/vector-icons';
import CreateVisitDailyForStaffScreen1 from './createVisitDailyForStaffScreen1';
import CreateVisitDailyForStaffScreen2 from './createVisitDailyForStaffScreen2';

const createVisitDailyLayout = () => {
    const buttonTextStyle = {
        color: 'green'
    };
    const progressStepsStyle = {
        activeStepIconBorderColor: '#3244a8',
        activeLabelColor: '#3244a8',
        activeStepNumColor: 'white',
        activeStepIconColor: '#3244a8',
        completedStepIconColor: '#3244a8',
        completedProgressBarColor: '#3244a8',
        completedCheckColor: 'white'
      };
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <Pressable
                className="flex flex-row items-center mt-2 space-x-2 px-4rounded-lg active:bg-gray-200"
            >
                <MaterialIcons name="arrow-back" size={35} color="#4B5563" />
                <Text className="text-gray-600 font-semibold text-xl">Tạo mới lịch hẹn</Text>
            </Pressable>
            <ProgressSteps {...progressStepsStyle} >
                <ProgressStep label="Tiêu đề" scrollable={false} nextBtnTextStyle={buttonTextStyle}>
                    <View style={{height : "90%" }}>
                        <CreateVisitDailyForStaffScreen1/>
                    </View>
                </ProgressStep>
                <ProgressStep label="Thêm khách" scrollable={false} nextBtnTextStyle={buttonTextStyle}>
                    <View style={{ height : "90%"}}>
                        <CreateVisitDailyForStaffScreen2/>
                    </View>
                </ProgressStep>
            </ProgressSteps>
        </SafeAreaView>
    )
}

export default createVisitDailyLayout