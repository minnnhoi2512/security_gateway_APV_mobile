import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi.service";
import { setupListeners } from "@reduxjs/toolkit/query";
import { visitApi } from "../services/visit.service";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [visitApi.reducerPath]: visitApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, visitApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);
