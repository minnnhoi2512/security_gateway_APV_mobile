import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
  StatusBar,
  Button,
} from "react-native";
import Header from "@/components/Header";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { uploadToFirebase } from "../../firebase-config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Checkin = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const router = useRouter();
   const [userId, setUserId] = useState<string | null>(null);
  const selectedGateId = useSelector((state: RootState) => state.gate.selectedGateId);


  
  useEffect(() => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    }
  }, [permission]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          // console.log("User ID from AsyncStorage:", storedUserId);
        } else {
          console.log("No userId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  
  

  const takePhoto = async () => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!cameraResp.canceled) {
        const { uri } = cameraResp.assets[0];
        const fileName = uri.split("/").pop();
        const uploadResp = await uploadToFirebase(uri, fileName, (v: any) =>
          console.log(v)
        );
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  if (!isPermissionGranted) {
    return (
      <View>
        <Text>Permission not granted</Text>
        <Button
          title="Request permission"
          onPress={requestPermission}
        ></Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header name="Đặng Dương" />
      <View className="flex-1 justify-center items-center px-4">
        <View>
          <Pressable onPress={requestPermission}>
            <Text>Request permissions</Text>
          </Pressable>
          <Link href={"/check-in/scanQr"} asChild>
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
      {/* <Text>Working with fb and ImagePicker</Text>
      <Button title="Take a picture" onPress={takePhoto}></Button> */}
    </SafeAreaView>
  );
};

export default Checkin;
