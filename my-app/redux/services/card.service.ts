// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


// const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;


// export const cardAPi = createApi({
//     reducerPath: 'cardApi',
//     baseQuery: fetchBaseQuery({
//         baseUrl: BASE_URL,
//         prepareHeaders: async (headers) => {
//             const token = await AsyncStorage.getItem('userToken');
//             if (token) {
//               headers.set('Authorization', `Bearer ${token}`);
//             }
//             return headers;
//           },
//     }),
//     endpoints: (builder) => ({
//         getVisitBy
//     })
// })