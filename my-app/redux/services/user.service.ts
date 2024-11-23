import { UpdateUserProfile, UserProfile } from "@/Types/user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const userApi = createApi({
  reducerPath: "userApi",
  tagTypes: ['UserProfile'],
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
    getAllStaff: builder.query({
      query: () => {
        return `User?pageNumber=1&pageSize=20&role=staff`;
      },
    }),
    getUserProfile: builder.query<UserProfile, { userId: string }>({
      query: ({ userId }) => `User/${userId}`,
    }),
    getStaffByPhone: builder.query({
      query: (phonenumber: string) => `User/Staff/${phonenumber}`
    }),
    updateUserProfile: builder.mutation({
      query: ({ userId, data }: { userId: string; data: UpdateUserProfile }) => ({
        url: `User/${userId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['UserProfile'] 
    })
  })
});

export const { useGetAllStaffQuery, useGetUserProfileQuery , useUpdateUserProfileMutation, useGetStaffByPhoneQuery } = userApi;
