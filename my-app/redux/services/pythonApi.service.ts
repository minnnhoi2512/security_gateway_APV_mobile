
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const BASE_URL = process.env. EXPO_PUBLIC_BASE_URL_DETECT || 'https://security-gateway-detect.tools.kozow.com/';

export const pythonAPI = createApi({
    reducerPath: 'pythonAPI',
    baseQuery: fetchBaseQuery({
      baseUrl: BASE_URL,
      prepareHeaders: async (headers) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        headers.set("accept", "application/json");
        headers.set("Content-Type", "multipart/form-data");
        return headers;
      },
    }),
    endpoints: (builder) => ({
      detectIdentityCard: builder.mutation<any, FormData>({
        query: (formData) => ({
          url: '/IdentityCard',
          method: 'POST',
          body: formData,
        }),
      }),
      detectDrivingLicense: builder.mutation<any, FormData>({
        query: (formData) => ({
          url: 'DrivingLicense',
          method: 'POST',
          body: formData,
        }),
      }),
    }),
  });
  
  export const { useDetectIdentityCardMutation } = pythonAPI;

// export const pythonAPI = createApi({
//     reducerPath: 'pythonApi',
//     baseQuery: fetchBaseQuery({
//         baseUrl:"https://security-gateway-detect.tools.kozow.com" ,
//         prepareHeaders: async (headers) => {
//             const token = await AsyncStorage.getItem('userToken');
//             if(token) {
//                 headers.set("Authorization", `Bearer ${token}`);
//             }
//             return headers;
//         },
//     }),
//     endpoints: (builder) => ({
//         detectIdentityCard: builder.mutation<any, FormData>({
//             query: (formData) => ({
//               url: '/IdentityCard',
//               method: 'POST',
//               body: formData,
//               headers: {
//                 'Content-Type': 'multipart/form-data',
//               },
//             }),
//           }),
//     }),

// });

// export const {
//     useDetectIdentityCardMutation
// } = pythonAPI