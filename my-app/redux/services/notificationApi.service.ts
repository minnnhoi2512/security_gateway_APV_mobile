import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import NotificationUserType from "../Types/notification.type";



const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const notificationAPI = createApi({
    reducerPath: 'notificationAPI',
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
        getUserNotification: builder.query<NotificationUserType[], {userID: string}>({
            query: ({userID}) => `Notification/User/${userID}`,
        }),
    })
})

export const { useGetUserNotificationQuery } = notificationAPI;