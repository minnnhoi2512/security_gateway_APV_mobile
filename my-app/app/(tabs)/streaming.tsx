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
  imageType: "Shoe";
  imageFile: string | null;
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
  const [index, setIndex] = useState(0);
  const [videoSource, setVideoSource] = useState(
    `https://security-gateway-camera.tools.kozow.com/video/output_${index}.mp4`
  );
  const [shouldPlay, setShouldPlay] = useState(true);

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
    }
  };

  useEffect(() => {
    getFileCount();
  }, []);

  useEffect(() => {
    if (index >= 0) {
      setVideoSource(
        `https://security-gateway-camera.tools.kozow.com/video/output_${
          index - 1
        }.mp4`
      );
      if (videoRef.current) {
        videoRef.current.replayAsync();
      }
    }
  }, [index]);

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

  useEffect(() => {
    if (autoCapture && !isLoading) {
      handleCapture();
    }
  }, [autoCapture]);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    try {
      const videoUrl = videoSource;
      const asset = Asset.fromModule(videoUrl);
      await asset.downloadAsync();
      const thumbnailUri = await generateThumbnail(asset.uri, currentTime);
      await processThumbnail(thumbnailUri);
    } catch (error) {
      console.error("Failed to capture frame:", error);
      try {
        const staticVideoUrl =
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        const thumbnailUri = await generateThumbnail(
          staticVideoUrl,
          currentTime
        );
        await processThumbnail(thumbnailUri);
      } catch (fallbackError) {
        console.error(
          "Failed to generate thumbnail from static video:",
          fallbackError
        );
        alert("Failed to capture frame from both video sources.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const processThumbnail = async (thumbnailUri: string) => {
    const base64 = await FileSystem.readAsStringAsync(thumbnailUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const base64Image = `data:image/jpeg;base64,${base64}`;

    const path = `${FileSystem.documentDirectory}captured_frame.jpg`;
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageData: ImageData = {
      imageType: "Shoe",
      imageFile: path,
    };
    setCapturedImage((prevImages) => [...prevImages, imageData]);

    if (onCaptureImage) {
      onCaptureImage(imageData);
    }

    console.log("Frame saved to:", path);
  };

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
          if (videoRef.current) {
            videoRef.current.playAsync();
          }
        }}
      />
      {/* <Text style={styles.text}>
        Press Capture to take a screenshot of the current frame
      </Text>
      <Button
        title={isLoading ? "Capturing..." : "Capture Frame"}
        onPress={handleCapture}
        disabled={isLoading}
      /> */}

      <Text style={styles.text}>
        Hình ảnh chụp từ camera
      </Text>
      {capturedImage.map((image, index) => (
        <Image
          key={index} // Provide a unique key for each image
          source={{ uri: image.imageFile || undefined }}
          style={styles.capturedImage}
          resizeMode="contain"
        />
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Trở lại" onPress={handlePrevious} />
        <Button title="Tiếp theo" onPress={handleNext} />
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
