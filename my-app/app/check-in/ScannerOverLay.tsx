// import React, { useState } from 'react';
// import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';

// const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
// const overlayColor = 'rgba(0,0,0,0.5)';

// const ScannerOverlay = ({ initialWidth = windowWidth * 0.5, initialHeight = windowWidth * 0.5, borderColor = '#FFD700', borderWidth = 2 }) => {
//   const [position, setPosition] = useState({ x: (windowWidth - initialWidth) / 2, y: (windowHeight - initialHeight) / 2 });
//   const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onPanResponderMove: (_, gestureState) => {
//       setPosition(prev => ({
//         x: Math.max(0, Math.min(prev.x + gestureState.dx, windowWidth - size.width)),
//         y: Math.max(0, Math.min(prev.y + gestureState.dy, windowHeight - size.height))
//       }));
//     },
//   });

//   return (
//     <View style={styles.container}>
//       {/* Top overlay */}
//       <View style={[styles.overlay, { height: position.y, width: windowWidth }]} />
      
//       <View style={{ flexDirection: 'row' }}>
//         {/* Left overlay */}
//         <View style={[styles.overlay, { height: size.height, width: position.x }]} />
        
//         {/* Focus area */}
//         <View 
//           {...panResponder.panHandlers}
//           style={[
//             styles.focusArea, 
//             { 
//               width: size.width, 
//               height: size.height, 
//               borderColor, 
//               borderWidth,
//               left: position.x,
//               top: position.y,
//             }
//           ]}
//         >
//           {/* Corner markers */}
//           <View style={[styles.cornerMarker, styles.topLeft]} />
//           <View style={[styles.cornerMarker, styles.topRight]} />
//           <View style={[styles.cornerMarker, styles.bottomLeft]} />
//           <View style={[styles.cornerMarker, styles.bottomRight]} />
//         </View>
        
//         {/* Right overlay */}
//         <View style={[styles.overlay, { height: size.height, width: windowWidth - position.x - size.width }]} />
//       </View>
      
//       {/* Bottom overlay */}
//       <View style={[styles.overlay, { height: windowHeight - position.y - size.height, width: windowWidth }]} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: windowWidth,
//     height: windowHeight,
//   },
//   overlay: {
//     backgroundColor: overlayColor,
//   },
//   focusArea: {
//     position: 'absolute',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cornerMarker: {
//     position: 'absolute',
//     width: 20,
//     height: 20,
//     borderColor: '#FFD700',
//   },
//   topLeft: {
//     top: 0,
//     left: 0,
//     borderLeftWidth: 2,
//     borderTopWidth: 2,
//   },
//   topRight: {
//     top: 0,
//     right: 0,
//     borderRightWidth: 2,
//     borderTopWidth: 2,
//   },
//   bottomLeft: {
//     bottom: 0,
//     left: 0,
//     borderLeftWidth: 2,
//     borderBottomWidth: 2,
//   },
//   bottomRight: {
//     bottom: 0,
//     right: 0,
//     borderRightWidth: 2,
//     borderBottomWidth: 2,
//   },
// });

// export default ScannerOverlay;