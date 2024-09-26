import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseQuery = fetchBaseQuery({
    baseUrl: '',
    prepareHeaders: async (headers) => {
        const token = await AsyncStorage.getItem('userToken');
        if(token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        
        return headers;
    }
});

export const baseApi = createApi({
    baseQuery,
    endpoints: () => ({}),
});
