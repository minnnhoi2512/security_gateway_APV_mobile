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

interface Visitor {
  visitorId: number;
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  credentialsCard: string;
  visitorCredentialImage: string;
  status: string;
}

interface VisitDetail {
  visitDetailId: number;
  expectedStartHour: string;
  expectedEndHour: string;
  status: boolean;
  sessionStatus: string | null;
  visitor: Visitor;
}

export interface VisitorSession {
  visitorSessionId: number;
  checkinTime: string;
  checkoutTime: string;
  qrCardId: number;
  visitDetail: VisitDetail;
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
  reducerPath: "visitorSessionApi",
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
    getVisitorSessions: builder.query<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        // return `/VisitorSession?pageNumber=${pageNumber}&pageSize=${}`;
        url: `/VisitorSession`,
        params: { pageNumber, pageSize },
      }),
    }),

    getVisitorSessionDay: builder.query({
      query: () => {
        const currentDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        return `VisitorSession/Date?pageNumber=1&pageSize=10&date=${currentDate}`;
      },
    }),
  }),
  // endpoints: (builder) => ({
  //   getVisitorSessions: builder.query<VisitorSessionResponse, { pageNumber: number; pageSize: number }>({
  //     query: ({ pageNumber, pageSize }) => ({
  //       url: `/VisitorSession?pageNumber=1&pageSize=10`,
  //       params: { pageNumber, pageSize }
  //     }),
  //   }),
  // }),
});

export const { useGetVisitorSessionsQuery, useGetVisitorSessionDayQuery } = visitorSessionApi;
