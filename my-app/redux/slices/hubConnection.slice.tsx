import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import HubConnectionType from "../../Types/hubConnectionType";


const initialState: HubConnectionType= {
    connection : null
};

const hubConnectionSlice = createSlice({
  name: "filterTabs",
  initialState,
  reducers: {
    setConnection(state, action : PayloadAction<React.MutableRefObject<signalR.HubConnection | null>>){
        state.connection = action.payload;
    },
    clearConnection(state){
        state.connection = null;
    }
    },
});

const hubConnectionReducer = hubConnectionSlice.reducer;
export const {setConnection, clearConnection} = hubConnectionSlice.actions
export default hubConnectionReducer;