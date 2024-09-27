
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.BASE_URL;

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    endpoints: (builder) => ({
        loginUser: builder.mutation({
            query: (body: {username: string, password: string}) => {
                return {
                    url: "User/Login",
                    method: "POST",
                    body,
                };
            },
        }),
    }),
});

export const { useLoginUserMutation  } = authApi;