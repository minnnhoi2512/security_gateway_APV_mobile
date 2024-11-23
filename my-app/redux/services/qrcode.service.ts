import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";


const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "https://securitygateapv-be-iiah.onrender.com/api/";

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

export const qrcodeApi = createApi({
  reducerPath: "qrcodeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    shoeDetect: builder.mutation<any, ImageFile>({
      query: (file) => {
        const formData = createFormData(file);
        return {
          url: 'QRCode/ShoeDetect',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
      transformErrorResponse: (response: FetchBaseQueryError | { status: number; data: unknown }) => {
        if ('status' in response) {
          if (response.status === 'PARSING_ERROR') {
            const rawText = response.data as string;
            const errorMessage = rawText.includes('Lỗi:')
              ? rawText.split('Lỗi:')[1].trim()
              : rawText;
            return { error: 'PARSING_ERROR', message: errorMessage };
          }
        }
        return response;
      },
    }),
    getDataByCardVerification: builder.query({
      query: (cardVerification: string) => `Card/${cardVerification}`
    })
  }),
});

function createFormData(file: ImageFile): FormData {
  const formData = new FormData();
  // Remove 'file://' prefix on iOS, keep it for Android
  const fileUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
console.log(`Final file URI being sent: ${fileUri}`);

  formData.append('image', {
    uri: fileUri,
    type: file.type || 'image/jpeg',
    name: file.name || 'image.jpg',
  } as any);

  return formData;
}

export const { useShoeDetectMutation, useGetDataByCardVerificationQuery } = qrcodeApi;