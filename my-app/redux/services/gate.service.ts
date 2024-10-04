import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Gate } from "../Types/gate.type";



const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const gateApi = createApi({
    reducerPath: 'gateApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = AsyncStorage.getItem('userToken');
            if(token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getAllGate: builder.query<Gate[], void>({
            query: () => 'Gate',
        }),
    })
})

export const { useGetAllGateQuery } = gateApi;