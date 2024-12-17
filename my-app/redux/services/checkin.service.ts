import { CheckInVer02, ValidCheckIn } from "@/Types/checkIn.type";
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
          formData = data;
        } else {
          formData = new FormData();
          if (
            data.VisitDetailId !== null &&
            data.VisitDetailId !== undefined
          ) {
            formData.append("VisitDetailId", data.VisitDetailId.toString());
          } else {
            console.error("CredentialCard is null or undefined.");
            throw new Error("CredentialCard cannot be null or undefined.");
          }

          formData.append("QrCardVerification", data.QrCardVerification || "");
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
        };
      },
    }),

    validCheckIn: builder.mutation<any, FormData | ValidCheckIn>({
      query: (data) => {
        let formData: FormData;
    
        if (data instanceof FormData) {
          formData = data;
        } else {
          formData = new FormData();
    
     
          formData.append("VisitDetailId", data.VisitDetailId?.toString() || "");
    
           
          formData.append("QrCardVerification", data.QRCardVerification || "");
    
          if (data.ImageShoe && data.ImageShoe.length === 1) {
            const image = data.ImageShoe[0]; 
            const imageName = image.imageFile.split("/").pop() || "default.jpg";
    
            formData.append("ImageShoe", {
              uri: image.imageFile,
              type: "image/jpeg",
              name: imageName,
            } as any);
          } else {
            console.error("ImageShoe is not populated correctly.");
            throw new Error("ImageShoe must contain exactly one image.");
          }
        }
    
        return {
          url: "/VisitorSession/ValidCheckIn",
          method: "POST",
          body: formData,
        };
      },
    }),
    
  }),
});

export const { useCheckInMutation, useValidCheckInMutation } = checkinApi;
