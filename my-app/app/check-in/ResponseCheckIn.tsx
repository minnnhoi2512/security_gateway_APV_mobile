// import { View, Text, ScrollView, Image } from 'react-native';
// import React from 'react';
// import { useLocalSearchParams } from 'expo-router';

// interface SessionsImage {
//   imageType: string;
//   imageURL: string;
//   image: null;
// }

// interface Card {
//   cardId: number;
//   cardVerification: string;
//   createDate: string;
//   lastCancelDate: string;
//   cardImage: string;
//   cardStatus: string;
//   qrCardTypename: string;
// }

// interface SessionsImageRes {
//   checkinTime: string;
//   securityInId: number;
//   gateInId: number;
//   images: SessionsImage[];
// }

// interface DetectShoeRes {
//   label: string;
//   confidence: number;
// }

// interface CheckInData {
//   visitDetailId: number;
//   securityInId: number;
//   gateInId: number;
//   sessionsImageRes: SessionsImageRes;
//   card: Card;
//   detectShoeRes: DetectShoeRes;
// }

// const ResponseCheckIn = () => {
//   const params = useLocalSearchParams();
//   const rawData = params.data as string;

//   // Log raw data for debugging
//   console.log('Raw Data:', rawData);

//   // Check if data is valid
//   if (!rawData || typeof rawData !== 'string') {
//     console.error('Invalid data received:', rawData);
//     return null; // or show an error message
//   }

//   // Clean up the data
//   const cleanData = rawData.replace(/^\?/, ''); // Only remove leading '?'
  
//   // Attempt to parse JSON
//   let parsedData: CheckInData;
//   try {
//     parsedData = JSON.parse(cleanData);
//   } catch (error) {
//     console.error('JSON Parse error:', error);
//     return null; // or show an error message
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleString();
//   };

//   return (
//     <ScrollView className="flex-1 bg-white p-4">
//       {/* Visit Details Section */}
//       <View className="mb-6">
//         <Text className="text-xl font-bold mb-2 text-blue-600">Visit Details</Text>
//         <View className="bg-gray-50 p-3 rounded-lg">
//           <Text className="text-gray-700">Visit ID: {parsedData.visitDetailId}</Text>
//           <Text className="text-gray-700">Security In ID: {parsedData.securityInId}</Text>
//           <Text className="text-gray-700">Gate In ID: {parsedData.gateInId}</Text>
//         </View>
//       </View>

//       {/* Check-in Time Section */}
//       <View className="mb-6">
//         <Text className="text-xl font-bold mb-2 text-blue-600">Check-in Information</Text>
//         <View className="bg-gray-50 p-3 rounded-lg">
//           <Text className="text-gray-700">
//             Check-in Time: {formatDate(parsedData.sessionsImageRes.checkinTime)}
//           </Text>
//         </View>
//       </View>

//       {/* Images Section */}
//       <View className="mb-6">
//         <Text className="text-xl font-bold mb-2 text-blue-600">Images</Text>
//         <View className="bg-gray-50 p-3 rounded-lg">
//           {parsedData.sessionsImageRes.images.map((img, index) => (
//             <View key={index} className="mb-2">
//               <Text className="text-gray-700 mb-1">Type: {img.imageType}</Text>
//               <Image 
//                 source={{ uri: img.imageURL }}
//                 className="w-full h-48 rounded-lg"
//                 resizeMode="cover"
//               />
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* Card Details Section */}
//       <View className="mb-6">
//         <Text className="text-xl font-bold mb-2 text-blue-600">Card Information</Text>
//         <View className="bg-gray-50 p-3 rounded-lg">
//           <Text className="text-gray-700">Card ID: {parsedData.card.cardId}</Text>
//           <Text className="text-gray-700">Verification: {parsedData.card.cardVerification}</Text>
//           <Text className="text-gray-700">Status: {parsedData.card.cardStatus}</Text>
//           <Text className="text-gray-700">Type: {parsedData.card.qrCardTypename}</Text>
//           <Text className="text-gray-700">Created: {formatDate(parsedData.card.createDate)}</Text>
//           <Text className="text-gray-700">Last Cancel: {formatDate(parsedData.card.lastCancelDate)}</Text>
//           <Image 
//             source={{ uri: `data:image/png;base64,${parsedData.card.cardImage}` }}
//             className="w-32 h-32 mt-2 rounded"
//             resizeMode="contain"
//           />
//         </View>
//       </View>

//       {/* Detection Results Section */}
//       <View className="mb-6">
//         <Text className="text-xl font-bold mb-2 text-blue-600">Detection Results</Text>
//         <View className="bg-gray-50 p-3 rounded-lg">
//           <Text className="text-gray-700">Label: {parsedData.detectShoeRes.label}</Text>
//           <Text className="text-gray-700">Confidence: {parsedData.detectShoeRes.confidence}%</Text>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// export default ResponseCheckIn;
