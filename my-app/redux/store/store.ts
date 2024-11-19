import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi.service";
import { setupListeners } from "@reduxjs/toolkit/query";
import { visitApi } from "../services/visit.service";
import { gateApi } from "../services/gate.service";
import gateSlice from "../slices/gate.slice";
import authSlice from "../slices/auth.slice";
import visitStaffCreateSlice from "../slices/visitStaffCreate.slice";
import { qrcodeApi } from "../services/qrcode.service";
import { checkinApi } from "../services/checkin.service";
import { visitorSessionApi } from "../services/checkout.service";
import { visitorApi } from "../services/visitor.service";
import { userApi } from "../services/user.service";
import { pythonAPI } from "../services/pythonApi.service";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [visitApi.reducerPath]: visitApi.reducer,
    [gateApi.reducerPath]: gateApi.reducer,
    gate: gateSlice,
    [qrcodeApi.reducerPath]: qrcodeApi.reducer,
    [checkinApi.reducerPath]: checkinApi.reducer,
    [visitorSessionApi.reducerPath]: visitorSessionApi.reducer,
    [visitorApi.reducerPath]: visitorApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [pythonAPI.reducerPath]: pythonAPI.reducer,
 
    auth: authSlice,
    visitStaff : visitStaffCreateSlice
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(
      authApi.middleware,
      visitApi.middleware,
      gateApi.middleware,
      qrcodeApi.middleware,
      checkinApi.middleware,
      visitorSessionApi.middleware, 
      visitorApi.middleware, 
      userApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);
