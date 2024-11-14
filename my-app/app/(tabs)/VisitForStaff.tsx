import { View, Text, StatusBar, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Header from '@/components/UI/Header'
import { useGetAllVisitsByCurrentDateQuery } from '@/redux/services/visit.service'
import { Visit2 } from "@/redux/Types/visit.type";
import VisitItem from '../home/VisitItem'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const visitForStaff = () => {
  const router = useRouter();
  const {
    data: visits,
    isLoading,
    isError,
  } = useGetAllVisitsByCurrentDateQuery({
    pageSize: 10,
    pageNumber: 1,
  }
  );
  const redirectToAddVisitPageHandler = () =>{
    router.push('/createVisitForStaff/createVisitDailyLayout');
  }
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <Header name="Đặng Dương" />
        <ScrollView>
          <Text className='pl-4 pt-3 font-extrabold text-2xl'>Lịch hẹn của bạn</Text>
          <Text className='pl-4 font-semibold text-xl'>Hôm nay</Text>
          <View className='pl-4 pr-4'>
          {visits && visits.length > 0 ? (
                visits.map((visit: Visit2) => (
                  <View className="py-1" key={visit.visitId}>
                    <VisitItem visit={visit} />
                  </View>
                ))
              ) : (
                <Text className="text-center text-gray-500 italic">
                  Không có lịch hẹn nào
                </Text>
              )}
            </View>
          <Text className='pl-8 font-semibold text-xl'>Trước đó</Text>
        </ScrollView>
      </View>
      <TouchableOpacity
        style= {styles.floatBtn}
        onPress={redirectToAddVisitPageHandler}
      >
        <Ionicons name='add-outline' size={25} color="#FFF"></Ionicons>
      </TouchableOpacity>
    </SafeAreaProvider>
  )
}
const styles = StyleSheet.create({
  floatBtn: {
    backgroundColor : "#34495e",
    width : 60,
    height : 60,
    position : "absolute",
    bottom : 0,
    right : 20,
    borderRadius : 50,
    justifyContent : "center",
    alignItems : "center"
  }
})
export default visitForStaff