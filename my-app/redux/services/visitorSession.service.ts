import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface SecurityPerson {
  userId: number;
  fullName: string;
  phoneNumber: string;
}

interface Gate {
  gateId: number;
  gateName: string;
}

interface SessionImage {
  visitorSessionsImageId: number;
  imageType: string;
  imageURL: string;
}

export interface VisitorSession {
  visitorSessionId: number;
  checkinTime: string;
  checkoutTime: string;
  qrCardId: number;
  visitDetailId: number;
  securityIn: SecurityPerson;
  securityOut: SecurityPerson;
  gateIn: Gate;
  gateOut: Gate;
  status: string;
  images: SessionImage[];
}

interface VisitorSessionResponse {
  items: VisitorSession[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const visitorSessionApi = createApi({
  reducerPath: 'visitorSessionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getVisitorSessions: builder.query<VisitorSessionResponse, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => ({
        url: `/VisitorSession?pageNumber=1&pageSize=10`,
        params: { pageNumber, pageSize }
      }),
    }),
  }),
});

export const {
  useGetVisitorSessionsQuery,
} = visitorSessionApi;