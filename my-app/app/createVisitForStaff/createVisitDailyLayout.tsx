import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';

import { MaterialIcons } from '@expo/vector-icons';
import CreateVisitDailyForStaffScreen1 from './createVisitDailyForStaffScreen1';
import CreateVisitDailyForStaffScreen2 from './createVisitDailyForStaffScreen2';
import VisitStaffCreate from '@/Types/VisitStaffCreate.Type';
import { useSelector } from 'react-redux';
import { useCreateVisitMutation } from '@/redux/services/visit.service';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
      const [createVisit, { isLoading }] = useCreateVisitMutation();
    const visitCreateData = useSelector<any>(s => s.visitStaff.data) as VisitStaffCreate

    const [error, SetError] = useState(true)
    const onNextStep = () => {
        if (!visitCreateData.visitName || !visitCreateData.description || visitCreateData.visitQuantity == 0 || !visitCreateData.visitDetail[0].expectedStartHour
            || !visitCreateData.visitDetail[0].expectedEndHour
        ) {
            SetError(true);
            Alert.alert("You must fill the form")
        } else {
          SetError(false);
        }
    };
    const onNextStep2 = async () =>{
        if(visitCreateData.visitDetail.length ===1){
            SetError(true);
            Alert.alert("No visitor is selected")
        } else {
            try{
                const userId = await AsyncStorage.getItem("userId")
                var submitData = {
                    ...visitCreateData,
                    visitQuantity: Number(visitCreateData.visitQuantity),
                    createById : Number(userId),
                    responsiblePersonId : Number(userId)
                  };
                  submitData.visitDetail = submitData.visitDetail.slice(1,submitData.visitDetail.length)

                  console.log("Submit Data:", submitData);
                  const result = await createVisit(submitData).unwrap().then((res)=>{
                    // console.log(res)
                    Alert.alert("Thành công", "Tạo lịch ghé thăm thành công!", [
                        {
                          text: "OK",
                        }
                      ]);
                  });
            }
            catch(error){
                Alert.alert("Create error", "Tạo lịch ghé thăm Khoonbg thành công!", [
                    {
                      text: "OK",
                    }
                  ]);
            }
            SetError(false);
        }
    }

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <Pressable
                className="flex flex-row items-center mt-2 space-x-2 px-4rounded-lg active:bg-gray-200"
            >
                <MaterialIcons name="arrow-back" size={35} color="#4B5563" />
                <Text className="text-gray-600 font-semibold text-xl">Tạo mới lịch hẹn</Text>
            </Pressable>
            <ProgressSteps {...progressStepsStyle} >
                <ProgressStep label="Tiêu đề" scrollable={false} nextBtnTextStyle={buttonTextStyle}
                    onNext={onNextStep} errors={error}
                >
                    <View style={{height : "90%" }}>
                        <CreateVisitDailyForStaffScreen1/>
                    </View>
                </ProgressStep>
                <ProgressStep label="Thêm khách" scrollable={false} nextBtnTextStyle={buttonTextStyle}
                        onSubmit={onNextStep2} errors={error}
                >
                    <View style={{ height : "90%"}}>
                        <CreateVisitDailyForStaffScreen2/>
                    </View>
                </ProgressStep>
            </ProgressSteps>
        </SafeAreaView>
    )
}

export default createVisitDailyLayout