import { CheckIn, CheckInVer02 } from "@/Types/checkIn.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const checkinApi = createApi({
  reducerPath: "checkinApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = AsyncStorage.getItem("userToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    checkIn: builder.mutation<any, FormData | CheckInVer02>({
      query: (data) => {
        let formData: FormData;

        if (data instanceof FormData) {
          formData = data; // Nếu đã là FormData, dùng trực tiếp
        } else {
          // Nếu là CheckInVer02, chuyển thành FormData
          formData = new FormData();
          formData.append("VisitDetailId", data.VisitDetailId.toString());
          formData.append("SecurityInId", data.SecurityInId.toString());
          formData.append("GateInId", data.GateInId.toString());
          formData.append("QrCardVerification", data.QrCardVerification);

          data.Images.forEach((image, index) => {
            formData.append(`Images[${index}].ImageType`, image.ImageType);
            formData.append(`Images[${index}].ImageURL`, image.ImageURL);
            formData.append(`Images[${index}].Image`, image.Image); 
          });
        }

        return {
          url: "/VisitorSession/CheckIn",
          method: "POST",
          body: formData,
          // Không cần Content-Type vì fetch sẽ tự thêm boundary
        };
      },
    }),
  }),
});

export const { useCheckInMutation } = checkinApi;
