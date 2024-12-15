import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

  
  const initialState: VisitStaffCreate = {
    visitName: "",
    visitQuantity: 0,
    expectedStartTime: new Date().toISOString(),
    expectedEndTime: new Date().toISOString(),
    createById: 0,
    description: "",
    responsiblePersonId: 0,
    visitDetail: [
    {
      expectedStartHour: "",
      expectedEndHour: "",
      visitorId: 0,
      visitorCompany: "",
      visitorName: ""
    }
    ]
  };
  
  const visitStaffCreateSlice = createSlice({
    name: 'visitStaffCreate',
    initialState: {
        data : initialState
    },
    reducers: {
      setVisitStaffCreate: (state, action: PayloadAction<VisitStaffCreate>) => {
        state.data = action.payload;
      },
      clearVisitStaffCreate: (state) => {
        state.data = initialState;
      },
    },
  });
  
  export const { setVisitStaffCreate, clearVisitStaffCreate } = visitStaffCreateSlice.actions;
  export default visitStaffCreateSlice.reducer;
  export { initialState };