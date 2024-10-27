import { View, Text, Image, Button } from "react-native";
import React, { useRef, useState } from "react";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";

const Streaming = () => {
  const videoRef = useRef<Video>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const captureImage = async () => {
    if (videoRef.current) {
      try {
        // Pause the video first (though this does not capture an image)
        await videoRef.current.pauseAsync();
        setIsPlaying(false);

        // Mock-up: Using a placeholder image (replace this logic with actual capture method if available)
        const savedFileUri = FileSystem.documentDirectory + "captured_image.png";
        
        // Log the URI to check the file path before sending to backend
        console.log("Captured Image URI:", savedFileUri);
        setCapturedImage(savedFileUri);

        // Add any logic here to send `savedFileUri` to your backend API
        // e.g., upload to a server using fetch or axios

      } catch (error) {
        console.error("Capture Error:", error);
      }
    }
  };

  const playVideo = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error("Play Video Error:", error);
      }
    }
  };

  return (
    <View>
      <Text>Streaming</Text>
      <Video
        ref={videoRef}
        source={{ uri: "https://security-gateway-camera.tools.kozow.com/index.m3u8" }}
        style={{ width: "100%", height: 300 }}
        onError={(e) => console.log("Video Error:", e)}
        shouldPlay={true}
      />
      {isPlaying && <Button title="Capture Image" onPress={captureImage} />}
      {!isPlaying && <Button title="Play Video" onPress={playVideo} />}
      
      {/* Show Captured Image */}
      {capturedImage && (
        <Image
          source={{ uri: capturedImage }}
          style={{ width: "100%", height: 300, marginTop: 10 }}
        />
      )}
    </View>
  );
};

export default Streaming;
