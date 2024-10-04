import { CheckIn } from "@/Types/checkIn.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const checkinApi = createApi({
  reducerPath: "checkinApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = AsyncStorage.getItem("userToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    checkIn: builder.mutation({
      query: (checkInData: CheckIn) => ({
        url: "VisitorSession/CheckIn",
        method: "POST",
        body: checkInData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useCheckInMutation } = checkinApi;
