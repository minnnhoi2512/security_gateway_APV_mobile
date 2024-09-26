import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `https://securitygateapv-be.onrender.com/api/User`,
    }),
    endpoints: (builder) => ({
        loginUser: builder.mutation({
            query: (body: {email: string, password: string}) => {
                return {
                    url: "/Login",
                    method: "POST",
                    body,
                };
            },
        }),
    }),
});

export const { useLoginUserMutation  } = authApi;