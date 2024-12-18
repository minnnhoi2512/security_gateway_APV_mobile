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
  tagTypes: ['Visit', 'VisitDetail'],
  endpoints: (builder) => ({
    getAllVisitsByCurrentDate: builder.query({
      query: () => {
        const currentDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
        return `Visit/Day?pageSize=-1&pageNumber=1&date=${currentDate}`;
      },
      providesTags: ['Visit']
    }),
    getVisitsByCurrentDate: builder.query({
      query: ({ pageSize, pageNumber }) => {
        // const currentDate = new Date().toISOString().split('T')[0];
        const currentDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          url: `Visit/Day`,
          params: {
            pageSize: pageSize,
            pageNumber: pageNumber,
            date: currentDate,
          }
        };
      },
      providesTags: ['Visit']
    }),
    getAllVisitsByCurrentDateByID: builder.query({
      query: (visitId: string) => {
        return `Visit/Day/${visitId}?pageSize=10&pageNumber=1`;
      },
      providesTags: ['Visit']
    }),
    getVisitDetailById: builder.query({
      query: (visitId: string) => `Visit/VisitDetail/${visitId}`,
      providesTags: (result, error, visitId) => [
        { type: 'VisitDetail', id: visitId }
      ]
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
      invalidatesTags: ['Visit']
    }),
    updateVisitStatus: builder.mutation({
      query: ({ visitId, newStatus }) => ({
        url: `Visit/Status/${visitId}?action=${newStatus}`,
        method: 'PUT',
      }),
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ visitId, newStatus }, { dispatch, queryFulfilled }) {
        // Optimistically update the getVisitDetailById cache
        const patchResult = dispatch(
          visitApi.util.updateQueryData('getVisitDetailById', visitId.toString(), (draft) => {
            if (draft) {
              draft.visitStatus = newStatus;
            }
          })
        );

        try {
          await queryFulfilled;
          // Invalidate both Visit and VisitDetail caches after successful update
          dispatch(
            visitApi.util.invalidateTags([
              { type: 'VisitDetail', id: visitId.toString() },
              'Visit'
            ])
          );
        } catch {
          // If the mutation fails, revert the optimistic update
          patchResult.undo();
        }
      },
      // Also invalidate these tags after the mutation
      invalidatesTags: (result, error, { visitId }) => [
        { type: 'VisitDetail', id: visitId.toString() },
        'Visit'
      ]
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