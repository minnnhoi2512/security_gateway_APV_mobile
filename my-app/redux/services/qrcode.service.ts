import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.BASE_URL || "https://securitygateapv-be-iiah.onrender.com/api/";

// Define the type for the file object
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
      console.log('Prepared headers:', headers);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    shoeDetect: builder.mutation<any, ImageFile>({
      query: (file) => ({
        url: 'QRCode/ShoeDetect',
        method: 'POST',
        body: createFormData(file),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),
  }),
});

// Helper function to create FormData
function createFormData(file: ImageFile): FormData {
  const formData = new FormData();
  formData.append('image', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);
  return formData;
}

export const { useShoeDetectMutation } = qrcodeApi;