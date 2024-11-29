import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { styled } from "nativewind";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useLoginUserMutation } from "@/redux/services/authApi.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setAuth } from "@/redux/slices/auth.slice";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      setRole(storedRole);
      console.log("ROLE FROM ASYNC STORAGE: ", storedRole);
    };
    fetchRole();
  }, []);
  // const handleLogin = async () => {
  //   try {
  //     const result = await loginUser({ username, password }).unwrap();
  //     console.log("Login successful, response:", result);

  //     if (result && result.jwtToken) {
  //       await AsyncStorage.setItem("userToken", result.jwtToken);
  //       await AsyncStorage.setItem("userId", result.userId.toString());
  //       console.log("Token saved to AsyncStorage");

  //       router.push("/PickGate");
  //     }
  //   } catch (error) {
  //     Alert.alert(
  //       "Đăng nhập thất bại",
  //       "Thông tin không hợp lệ. Vui lòng thử lại."
  //     );
  //   }
  // };

  const handleLogin = async () => {
    try {
      const result = await loginUser({ username, password }).unwrap();
      console.log("Login successful, response:", result);
      if (result && result.jwtToken) {
        await AsyncStorage.setItem("userToken", result.jwtToken);
        await AsyncStorage.setItem("userId", result.userId.toString());
        console.log("Token saved to AsyncStorage");

        const decodedToken = jwtDecode<{ role: string }>(result.jwtToken);
        const role = decodedToken.role;
        await AsyncStorage.setItem("userRole", role);
        dispatch(setAuth({
          token: result.jwtToken,
          userId: result.userId.toString(),
          role: role,
        }));

        if(role === "Security") {
          router.push("/PickGate");
        } else {
          router.push("/VisitForStaff");
        }

       
      }
    } catch (error) {
      console.error("Login failed with error:", error);
      Alert.alert(
        "Đăng nhập thất bại",
        "Thông tin không hợp lệ. Vui lòng thử lại."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#34495e]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <StyledView className="flex-1 p-6 mt-[70px]">
          <StyledView className="items-center mb-8">
            <StyledImage 
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/11135/11135368.png" }}
              className="w-24 h-24"
            />
            <StyledText className="text-white text-xl font-bold mt-4">
              SECURITY GATE APV
            </StyledText>
          </StyledView>

          <StyledView className="bg-white rounded-lg p-6 shadow-lg">
            <StyledText className="text-2xl font-bold mb-4 text-[#5163B5]">
              Đăng nhập
            </StyledText>
            <StyledText className="text-gray-600 mb-6">
              Vui lòng đăng nhập để tiếp tục
            </StyledText>

            <StyledView className="mb-4">
              <StyledText className="text-gray-700 mb-2">Tên đăng nhập</StyledText>
              <StyledTextInput
                className="bg-gray-100 rounded-lg p-3"
                placeholder="Nhập tên đăng nhập của bạn"
                value={username}
                onChangeText={setUsername}
              />
            </StyledView>

            <StyledView className="mb-4">
              <StyledText className="text-gray-700 mb-2">Mật khẩu</StyledText>
              <StyledView className="relative">
                <StyledTextInput
                  className="bg-gray-100 rounded-lg p-3 pr-10"
                  placeholder="Nhập mật khẩu"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity className="absolute right-3 top-3">
                  <FontAwesome name="eye" size={20} color="gray" />
                </TouchableOpacity>
              </StyledView>
            </StyledView>

            <TouchableOpacity className="mb-6">
              <StyledText className="text-[#5163B5] text-right">
                Quên mật khẩu?
              </StyledText>
            </TouchableOpacity>

            <StyledTouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="bg-[#5d6d7e] rounded-lg p-4 items-center"
            >
              <StyledText className="text-white font-bold text-lg">
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;