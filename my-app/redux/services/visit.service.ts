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
        return `Visit/Day?pageSize=10&pageNumber=1&date=${currentDate}`;
      },
    }),
    getVisitDetailById: builder.query({
      query: (visitId: string) => `Visit/VisitDetail/${visitId}`,
    }),
    getVisitByCredentialCard: builder.query({
      query: (credentialCard: string) => {
        const currentDate = new Date().toISOString().split('T')[0];
        // return `Visit/CurrentDate/CredentialCard/${credentialCard}?date=${currentDate}`;
        return `Visit/CurrentDate/CredentialCard/${credentialCard}`;
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
      query: ({visitId, newStatus}) => ({
        url: `Visit/Status/${visitId}?action=${newStatus}`,
        method: 'PUT',
 
      })
    })
  }),
});

export const {
  useGetAllVisitsByCurrentDateQuery,
  useGetVisitDetailByIdQuery,
  useGetVisitByCredentialCardQuery,
  useCreateVisitMutation,
  useUpdateVisitStatusMutation
} = visitApi;
