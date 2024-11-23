import React, { useRef, useState, useCallback, useEffect } from "react";
import { View, Button, StyleSheet, Image, Text } from "react-native";
import { Video, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Asset } from "expo-asset";

export enum ResizeMode {
  CONTAIN = "contain",
  COVER = "cover",
  STRETCH = "stretch",
}


const VideoPlayer = ({

}) => {
  const videoRef = useRef<Video | null>(null);


  const [isVideoReady, setIsVideoReady] = useState(false);



  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: "https://security-gateway-camera.tools.kozow.com/libs/index.m3u8" }}
        style={styles.video}
        useNativeControls
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

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  video: {
    width: "100%",
    height: 300,
  },
  capturedImage: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  text: {
    marginVertical: 10,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "60%",
  },
});

export default VideoPlayer;

