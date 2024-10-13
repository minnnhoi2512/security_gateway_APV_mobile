import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  "https://securitygateapv-be-iiah.onrender.com/api/";
  
export const visitorSessionApi = createApi({
  reducerPath: "visitorSessionApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    checkOut: builder.mutation({
      query: ({ qrCardVerifi, checkoutData }) => ({
        url: `VisitorSession/CheckOut?qrCardVerifi=${qrCardVerifi}`,
        method: "PUT",
        body: checkoutData,
      }),
    }),
    getVissitorSession: builder.query({
      query: (qrCardVerified: string) => `VisitorSession/QrCard/${qrCardVerified}`,
    }),
  }),
});

export const { useCheckOutMutation, useGetVissitorSessionQuery } = visitorSessionApi;
