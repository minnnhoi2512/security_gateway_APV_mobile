import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const CreateCustomer = () => {
  const router = useRouter();

  return (
    <View className='flex-1 justify-center'>
      <TouchableOpacity  onPress={() => router.push('/createVisit/FormCreate')} className="bg-[#5163B5] rounded-2xl p-4 items-center w-[200px] mt-4">
      <Text>Tạo thông thường</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CreateCustomer