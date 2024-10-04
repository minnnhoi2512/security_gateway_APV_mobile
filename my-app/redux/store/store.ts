import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi.service";
import { setupListeners } from "@reduxjs/toolkit/query";
import { visitApi } from "../services/visit.service";
import { gateApi } from "../services/gate.service";
import gateSlice from "../slices/gate.slice";
import { qrcodeApi } from "../services/qrcode.service";
import { checkinApi } from "../services/checkin.service";
import { visitorSessionApi } from "../services/checkout.service";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [visitApi.reducerPath]: visitApi.reducer,
    [gateApi.reducerPath]: gateApi.reducer,
    gate: gateSlice,
    [qrcodeApi.reducerPath]: qrcodeApi.reducer,
    [checkinApi.reducerPath]: checkinApi.reducer,
    [visitorSessionApi.reducerPath]: visitorSessionApi.reducer,

  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, visitApi.middleware, gateApi.middleware, qrcodeApi.middleware, checkinApi.middleware,visitorSessionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);
