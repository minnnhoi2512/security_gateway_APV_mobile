// import React, { useRef, useState, useCallback, useEffect } from "react";
// import { View, Button, StyleSheet, Image, Text } from "react-native";
// import { Video, AVPlaybackStatus } from "expo-av";
// import * as FileSystem from "expo-file-system";
// import * as VideoThumbnails from "expo-video-thumbnails";
// import { Asset } from "expo-asset";

// export enum ResizeMode {
//   CONTAIN = "contain",
//   COVER = "cover",
//   STRETCH = "stretch",
// }


// const VideoPlayer = ({

// }) => {
//   const videoRef = useRef<Video | null>(null);


//   const [isVideoReady, setIsVideoReady] = useState(false);



//   return (
//     <View style={styles.container}>
//       <Video
//         ref={videoRef}
//         source={{ uri: "https://security-gateway-camera-1.tools.kozow.com/libs/index.m3u8" }}
//         style={styles.video}
//         useNativeControls
//         resizeMode={ResizeMode.CONTAIN}
//         isLooping
//         shouldPlay={true}
//         onReadyForDisplay={() => {
//           setIsVideoReady(true);
//           if (videoRef.current) {
//             videoRef.current.playAsync();
//           }
//         }}
//       />

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   video: {
//     width: "100%",
//     height: 300,
//   },
//   capturedImage: {
//     width: 300,
//     height: 300,
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     backgroundColor: "#fff",
//   },
//   text: {
//     marginVertical: 10,
//     color: "#333",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//     width: "60%",
//   },
// });

// export default VideoPlayer;


import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Video } from "expo-av";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export enum ResizeMode {
  CONTAIN = "contain",
  COVER = "cover",
  STRETCH = "stretch",
}

const VideoPlayer = () => {
  const videoRef = useRef<Video | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <View className="flex-1 bg-gray-100 p-4 justify-center">
      <View className="bg-white rounded-xl shadow-lg overflow-hidden">
 
        <View className="bg-blue-600 p-4 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <MaterialIcons name="videocam" size={24} color="white" />
            <Text className="text-white font-semibold text-lg">
              Camera Stream
            </Text>
          </View>
          <Text className="text-white text-sm">
            {isVideoReady ? "Live" : "Connecting..."}
          </Text>
        </View>

   
        <View className="relative">
          <Video
            ref={videoRef}
            source={{
              uri: "https://security-gateway-camera-1.tools.kozow.com/libs/index.m3u8",
            }}
            className="w-full h-72"
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={true}
            onReadyForDisplay={() => {
              setIsVideoReady(true);
              if (videoRef.current) {
                videoRef.current.playAsync();
              }
            }}
          />

    
          {!isVideoReady && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-white mt-2">Loading stream...</Text>
            </View>
          )}
 
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={togglePlayPause}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleMute}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-medium"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>

 
        <View className="p-4 flex-row justify-between items-center bg-gray-50">
          <View className="flex-row items-center space-x-2">
            <View className={`w-2 h-2 rounded-full ${isVideoReady ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-sm text-gray-600">
              {isVideoReady ? "Đã kết nối" : "Đang kết nối..."}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">
            Camera chụp ảnh khách
          </Text>
        </View>
      </View>

 
      <View className="mt-4 p-4 bg-white rounded-xl shadow">
        <Text className="text-gray-700 font-medium mb-2">Thông tin</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Trạng thái</Text>
            <Text className="text-gray-700">
              {isVideoReady ? "Active" : "Connecting"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Chất lượng</Text>
            <Text className="text-gray-700">HD</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default VideoPlayer;