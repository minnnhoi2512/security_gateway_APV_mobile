// import React from 'react';
// import { View, StyleSheet, Dimensions } from 'react-native';

// const { width, height } = Dimensions.get('window');
// const innerDimension = 300;

// export const Overlay = () => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.overlay} />
//       <View style={styles.innerHole} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   innerHole: {
//     position: 'absolute',
//     width: innerDimension,
//     height: innerDimension,
//     left: width / 2 - innerDimension / 2,
//     top: height / 2 - innerDimension / 2,
//     backgroundColor: 'transparent',
//     borderRadius: 50,
//   },
// });

// import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";
// import { Dimensions, Platform, StyleSheet } from "react-native";
// const { width, height } = Dimensions.get("window");
// const innerDimension = 200;
// const outer = rrect(rect(0, 0, width, height), 0, 0);
// const inner = rrect(
//   rect(
//     width / 2 - innerDimension / 2,
//     height / 2 - innerDimension / 2,
//     innerDimension,
//     innerDimension
//   ),
//   50,
//   50
// );
//  const Overlay = () => {
//   return (
//     <Canvas
//       style={
//         Platform.OS === "android" ? { flex: 1 } : StyleSheet.absoluteFillObject
//       }
//     >
//       <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
//     </Canvas>
//   );
// };

// export default Overlay;

import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";
import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
const innerDimension = 200;

const Overlay = () => {
  const outer = rrect(rect(0, 0, width, height), 0, 0);
  const inner = rrect(
    rect(
      width / 2 - innerDimension / 2,
      height / 2 - innerDimension / 2,
      innerDimension,
      innerDimension
    ),
    50,
    50
  );

  return (
    <Canvas style={styles.overlay}>
      <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default Overlay;