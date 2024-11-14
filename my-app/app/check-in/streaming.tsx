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

interface ImageData {
  ImageType: "Shoe";
  ImageURL: string | null;
  ImageFile: string | null;
}
interface VideoPlayerProps {
  onCaptureImage: (imageData: ImageData) => void;
  autoCapture: boolean;
}



const VideoPlayer: React.FC<VideoPlayerProps> = ({
  onCaptureImage,
  autoCapture,
}) => {
  const videoRef = useRef<Video | null>(null);
  const [capturedImage, setCapturedImage] = useState<ImageData[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [videoSource, setVideoSource] = useState("");
  const autoCaptureAttempted = useRef(false);

  // Fetch initial file count
  const getFileCount = async () => {
    try {
      const response = await fetch(
        "https://security-gateway-camera.tools.kozow.com/count-files"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const count = data.count > 0 ? data.count - 2 : 0;
      setIndex(count);
    } catch (error) {
      console.error("Error fetching file count:", error);
      // Set a default index if fetch fails
      setIndex(0);
    }
  };

  // Initial setup
  useEffect(() => {
    getFileCount();
  }, []);

  // Update video source when index changes
  useEffect(() => {
    if (index >= 0) {
      const newSource = `https://security-gateway-camera.tools.kozow.com/video/output_${index - 1}.mp4`;
      setVideoSource(newSource);
      setIsVideoReady(false); // Reset video ready state
      autoCaptureAttempted.current = false; // Reset auto-capture attempt flag
    }
  }, [index]);

  // Handle video playback status updates
  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setCurrentTime(status.positionMillis);
        if (status.didJustFinish) {
          setIndex((prevIndex) => Math.min(prevIndex + 1, 999999));
        }
      }
    },
    [index]
  );

  // Generate thumbnail from video
  const generateThumbnail = async (videoUri: string, timeMillis: number) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: timeMillis,
        quality: 1,
      });
      return uri;
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      throw error;
    }
  };

  // Process captured thumbnail
  const processThumbnail = async (thumbnailUri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(thumbnailUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const path = `${FileSystem.documentDirectory}captured_frame_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imageData: ImageData = {
        ImageType: "Shoe",
        ImageURL:"",
        ImageFile: path,
      };
      
      setCapturedImage([imageData]); // Replace existing images instead of adding
      onCaptureImage(imageData);

      return path;
    } catch (error) {
      console.error("Failed to process thumbnail:", error);
      throw error;
    }
  };

  // Handle capture functionality
  const handleCapture = async () => {
    if (!videoRef.current || !videoSource || isLoading) return;

    setIsLoading(true);
    try {
      // Try with current video source first
      const thumbnailUri = await generateThumbnail(videoSource, currentTime);
      await processThumbnail(thumbnailUri);
    } catch (error) {
      console.error("Failed to capture from primary source:", error);
      try {
        // Fallback to static video if primary source fails
        const staticVideoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        const thumbnailUri = await generateThumbnail(staticVideoUrl, currentTime);
        await processThumbnail(thumbnailUri);
      } catch (fallbackError) {
        // console.error("Failed to capture from fallback source:", fallbackError);
        alert("Lấy ảnh thất bại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle auto-capture when video is ready
  useEffect(() => {
    if (isVideoReady && autoCapture && !autoCaptureAttempted.current && !isLoading) {
      autoCaptureAttempted.current = true;
      handleCapture();
    }
  }, [isVideoReady, autoCapture, isLoading]);

  const handleNext = () => {
    setIndex((prevIndex) => Math.min(prevIndex + 1, 999999));
  };

  const handlePrevious = () => {
    setIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoSource }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        isLooping
        shouldPlay={true}
        onReadyForDisplay={() => {
          setIsVideoReady(true);
          if (videoRef.current) {
            videoRef.current.playAsync();
          }
        }}
      />

    
      
      {capturedImage.map((image, index) => (
        <Image
          key={`${image.ImageFile}-${index}`}
          source={{ uri: image.ImageFile || undefined }}
          style={styles.capturedImage}
          resizeMode="contain"
        />
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Trở lại" onPress={handlePrevious} disabled={isLoading} />
        <Button title="Tiếp theo" onPress={handleNext} disabled={isLoading} />
      </View>
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

