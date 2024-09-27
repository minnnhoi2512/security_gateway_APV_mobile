
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const BASE_URL = process.env.BASE_URL;


export const visitApi = createApi({
  reducerPath: 'visitApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = AsyncStorage.getItem('userToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllVisitsByCurrentDate: builder.query({
      query: () => 'Visit/GetAllVisitsByCurrentDate?pageSize=10&pageNumber=1',
    }),
    getVisitDetailById: builder.query({
      query: (visitId: string) => `Visit/GetVisitDetailByVisitId/${visitId}`,
    }),
    getVisitByCredentialCard: builder.query({
      query: (credentialCard: string) => `Visit/GetVisitByCredentialCard/${credentialCard}` ,
    })
  }),
});

export const { useGetAllVisitsByCurrentDateQuery, useGetVisitDetailByIdQuery, useGetVisitByCredentialCardQuery } = visitApi;
