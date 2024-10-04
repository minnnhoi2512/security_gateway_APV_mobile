import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GateState {
    selectedGateId: number | null;
  }
  
  const initialState: GateState = {
    selectedGateId: null,
  };
  
  const gateSlice = createSlice({
    name: 'gate',
    initialState,
    reducers: {
      setSelectedGate: (state, action: PayloadAction<number>) => {
        state.selectedGateId = action.payload;
      },
      clearSelectedGate: (state) => {
        state.selectedGateId = null;
      },
    },
  });
  
  export const { setSelectedGate, clearSelectedGate } = gateSlice.actions;
  export default gateSlice.reducer;