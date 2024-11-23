import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';

const AddButton = () => {
    const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const router = useRouter();
    const handleScanPress = async () => {
        if (permission?.granted) {
          router.push("/createVisit/ScanQrCreate");
          // router.push("/createVisit/FormCreate");
        } else {
          const { granted } = await requestPermission();
          if (granted) {
            router.push("/createVisit/ScanQrCreate");
            // router.push("/createVisit/FormCreate");
          } else {
            // Handle permission denied
            console.log("Camera permission denied");
          }
        }
      };
  return (
    <View className="absolute bottom-36 right-4 z-50">
      <TouchableOpacity
        className="bg-backgroundApp rounded-full p-4 shadow-lg"
        onPress={handleScanPress}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AddButton;