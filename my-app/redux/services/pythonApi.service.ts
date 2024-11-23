import { Visitor } from "@/Types/visitor.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const pythonAPI = createApi({
    reducerPath: 'pythonApi',
    baseQuery: fetchBaseQuery({
        baseUrl:"https://security-gateway-detect.tools.kozow.com" ,
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem('userToken');
            if(token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        detectIdentityCard: builder.mutation<any, FormData>({
            query: (formData) => ({
              url: '/IdentityCard',
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }),
          }),
    }),

});

export const {
    useDetectIdentityCardMutation
} = pythonAPI