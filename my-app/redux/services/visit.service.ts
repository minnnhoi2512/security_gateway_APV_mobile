import { CreateVisit } from "@/Types/visit.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const BASE_URL2 = `https://securitygateapv-be-y69w.onrender.com/api/`;

export const visitApi = createApi({
  reducerPath: 'visitApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllVisitsByCurrentDate: builder.query({
      query: () => {
        const currentDate = new Date().toISOString().split('T')[0];
        return `Visit/Day?pageSize=-1&pageNumber=1&date=${currentDate}`;
      },
    }),
    getVisitsByCurrentDate: builder.query({
      query: ({ pageSize, pageNumber }) => {
        const currentDate = new Date().toISOString().split('T')[0];
        return {
          url: `Visit/Day`,
          params: {
            pageSize: pageSize,
            pageNumber: pageNumber,
            date: currentDate,
          }
        };
      },
    }),
    getAllVisitsByCurrentDateByID: builder.query({
      query: (visitId: string) => {
        return `Visit/Day/${visitId}?pageSize=10&pageNumber=1`;
      },
    }),
    getVisitDetailById: builder.query({
      query: (visitId: string) => `Visit/VisitDetail/${visitId}`,
    }),
    getVisitByCredentialCard: builder.query({
      query: ({ VerifiedId, verifiedType }) => {
        const currentDate = new Date().toISOString().split('T')[0];
        return `Visit/Day/VerifiedId/${VerifiedId}?verifiedType=${verifiedType}`;
      },
    }),
    createVisit: builder.mutation({
      query: (visit: CreateVisit) => ({
        url: '/Visit/Daily',
        method: 'POST',
        body: visit,
      }),
    }),
    updateVisitStatus: builder.mutation({
      query: ({ visitId, newStatus }) => ({
        url: `Visit/Status/${visitId}?action=${newStatus}`,
        method: 'PUT',

      })
    })
  }),
});

export const {
  useGetVisitsByCurrentDateQuery,
  useGetAllVisitsByCurrentDateQuery,
  useGetVisitDetailByIdQuery,
  useGetAllVisitsByCurrentDateByIDQuery,
  useGetVisitByCredentialCardQuery,
  useCreateVisitMutation,
  useUpdateVisitStatusMutation
} = visitApi;
