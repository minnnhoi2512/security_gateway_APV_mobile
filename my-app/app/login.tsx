import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { styled } from "nativewind";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const Login: React.FC = () => {


  const router = useRouter();

  return (
    <View className="flex-1 bg-[#5163B5]">
      <View className="flex-1 justify-center items-center">
        <StyledImage
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/11135/11135368.png",
          }}
          className="w-32 h-32"
        />
      </View>
      <StyledView className="flex-1 bg-white rounded-t-3xl p-6">
        <StyledText className="text-2xl font-bold mb-6 text-center text-[#3D6BE0]">
          Đăng nhập
        </StyledText>

        <StyledView className="flex flex-row items-center border-b border-gray-400 mb-4">
          <StyledView className="pr-2">
            <FontAwesome name="user-circle" size={24} color="black" />
          </StyledView>
          <StyledTextInput
            className="flex-1 bg-transparent p-3"
            placeholder="Tên đăng nhập"
            placeholderTextColor="#999"
          />
        </StyledView>

        <StyledView className="flex flex-row items-center border-b border-gray-400 mb-8">
          <StyledView className="pr-2">
            <Entypo name="lock" size={24} color="black" />
          </StyledView>
          <StyledTextInput
            className="flex-1 bg-transparent p-3"
            placeholder="Tên đăng nhập"
            placeholderTextColor="#999"
            secureTextEntry
          />
        </StyledView>

        {/* <StyledTextInput
          className="bg-gray-100 rounded-lg p-4 mb-4"
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry
        /> */}
        <StyledTouchableOpacity>
          <StyledText className="text-blue-500 text-right mb-6">
            Quên mật khẩu?
          </StyledText>
        </StyledTouchableOpacity>

        
        <StyledView className="flex items-center justify-center">
          <StyledTouchableOpacity onPress={() => router.push('/(tabs)')} className="bg-[#5163B5] rounded-2xl p-4 items-center w-[200px] mt-4">
            <StyledText className="text-white font-bold text-lg">
              Đăng nhập
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </View>
  );
};

export default Login;
