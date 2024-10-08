import { View, Text, TouchableOpacity, Button, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { useCameraPermissions } from 'expo-camera';
import { useGetAllVisitsByCurrentDateQuery } from '@/redux/services/visit.service';

const CreateCustomer = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    }
  }, [permission]);
  return (
    <View className='flex-1 justify-center'>
      <TouchableOpacity  onPress={() => router.push('/createVisit/FormCreate')} className="bg-[#5163B5] rounded-2xl p-4 items-center w-[200px] mt-4">
      <Text>Tạo visit</Text>
      </TouchableOpacity>
      <TouchableOpacity  onPress={() => router.push('/createVisitor/CreateVisitor')} className="bg-[#5163B5] rounded-2xl p-4 items-center w-[200px] mt-4">
      <Text>Tạo visitor</Text>
      </TouchableOpacity>
      <View className="justify-center items-center px-4">
        <View>
          <Pressable onPress={requestPermission}>
            <Text>Request permissions</Text>
          </Pressable>
          <Link href={"/createVisit/ScanQrCreate"} asChild>
            <Pressable disabled={!isPermissionGranted}>
              <Text style={[{ opacity: !isPermissionGranted ? 0.5 : 1 }]}>
                Scan code
              </Text>
            </Pressable>
          </Link>
        </View>
        {/* <TouchableOpacity
          onPress={() => router.push('/check-in/UserDetail')}
          className="bg-[#5163B5] rounded-2xl p-4 items-center w-[200px] mt-4"
        >
          <Text className="text-white font-bold text-lg">
            Next
          </Text>
        </TouchableOpacity> */}
      </View>
    </View>
  )
}

export default CreateCustomer