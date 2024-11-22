import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  "https://securitygateapv-be-iiah.onrender.com/api/";

export const checkOutApi = createApi({
  reducerPath: "checkOutApi",
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
    checkOutWithCard: builder.mutation({
      query: ({ qrCardVerifi, checkoutData }) => ({
        url: `VisitorSession/CheckOutWithCard?qrCardVerifi=${qrCardVerifi}`,
        method: "PUT",
        body: checkoutData,
      }),
    }),
    checkOutWithCredentialCard: builder.mutation({
      query: ({ credentialCard, checkoutData }) => ({
        url: `VisitorSession/CheckOutWithCredentialCard?credentialCard=${credentialCard}`,
        method: "PUT",
        body: checkoutData,
      }),
    }),
    getVissitorSession: builder.query({
      query: (qrCardVerified: string) =>
        `VisitorSession/QrCard/${qrCardVerified}`,
    }),
    getVissitorSessionByCardverified: builder.query({
      query: (qrCardVerified: string) =>
        `VisitorSession/StatusCheckIn/Card/${qrCardVerified}`,
    }),
    getVissitorSessionByCredentialId: builder.query({
      query: (credentialId: string) =>
        `VisitorSession/StatusCheckIn/CredentialId/${credentialId}`,
    }),
    getVisitorImageByVisitorSessionId: builder.query({
      query: (visitorSessionId: number) =>
        `VisitorSession/Images/${visitorSessionId}`,
    }),
  }),
});

export const {
  useCheckOutWithCardMutation,
  useCheckOutWithCredentialCardMutation,
  useGetVissitorSessionQuery,
  useGetVissitorSessionByCredentialIdQuery,
  useGetVissitorSessionByCardverifiedQuery,
  useGetVisitorImageByVisitorSessionIdQuery,
} = checkOutApi;
