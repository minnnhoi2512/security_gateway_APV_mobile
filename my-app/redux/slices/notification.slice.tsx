import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notiList",
  initialState: {
    //notification : JSON.parse(localStorage.getItem("notification") as string) as NotificationType[],
    isnew: false,
    takingNew: false,
  },
  reducers: {
    pushNotification(state) {
      //state.notification?.push(action.payload)
      state.takingNew = true;
      if (state.isnew == true) {
        state.isnew = false;
      } else {
        state.isnew = true;
      }
    },
    reloadNoti(state) {
      state.takingNew = false;
      if (state.isnew == true) {
        state.isnew = false;
      } else {
        state.isnew = true;
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      if (state.isnew == true) {
        state.isnew = false;
      } else {
        state.isnew = true;
      }
      console.log(action);
    },
  },
});

const notificationReducer = notificationSlice.reducer;
export const { pushNotification, markAsRead, reloadNoti } =
  notificationSlice.actions;
export default notificationReducer;
