
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const visitorApi = createApi({
    reducerPath: 'visitorApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem('userToken');
            if(token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createVisitor: builder.mutation<Visitor, FormData>({
            query: (formData) => ({
              url: '/Visitor',
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }),
          }),
          getVisitorByCreadentialCard: builder.query({
            query: (credentialCard: string) => {
                return `Visitor/CredentialCard/${credentialCard}`
            },
          }),
          getVisitorById: builder.query({
            query: (visitorId: string) => {
                return `Visitor/${visitorId}`
            },
          })
    }),

});

export const {
    useCreateVisitorMutation,
    useGetVisitorByCreadentialCardQuery,
    useGetVisitorByIdQuery
} = visitorApi