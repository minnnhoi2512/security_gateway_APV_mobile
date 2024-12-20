import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { CameraView } from 'expo-camera';

const CameraScanCCCD = () => {
    const [isCameraActive, setIsCameraActive] = useState(true);
    return (
        <View className="flex-1 bg-black justify-center items-center">

            {/* <>
                <View style={{ flex: 1, width: "100%", height: "100%" }}>
                    {isCameraActive && (
                        <CameraView
                            style={styles.camera}
                            onBarcodeScanned={
                                activeCamera === "QR"
                                    ? handleBarCodeScanned
                                    : handleLicensePlateScanned
                            }
                        />
                    )}
                </View>
            </>
            <Overlay /> */}
        </View>
    )
}

export default CameraScanCCCD
const styles = StyleSheet.create({
    camera: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      },
})