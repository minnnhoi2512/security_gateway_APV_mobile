import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ValidCheckInState {
  type: "CredentialCard" | "QRCardVerified";
  isVehicle: boolean;
  VisitDetailId: number;
  SecurityInId: number;
  GateInId: number;
  QrCardVerification: string ;
  CredentialCard: string | null;
  Images: Array<Images> | null;
  VehicleSession: VehicleSession | null;
}

interface Images {
  ImageType: string;
  ImageURL: string;
  Image: string | null;
}

interface VehicleSession {
  LicensePlate: string;
  vehicleImages: Array<{
    ImageType: string;
    ImageURL: string;
    Image: string;
  }>;
}

const initialState: ValidCheckInState = {
  type: "QRCardVerified",
  isVehicle: false,
  VisitDetailId: 0,
  SecurityInId: 0,
  GateInId: 0,
  QrCardVerification: "",
  CredentialCard: null,
  Images: null,
  VehicleSession: null,
};

const validCheckInSlice = createSlice({
  name: 'validCheckIn',
  initialState,
  reducers: {
    setValidCheckIn(state, action: PayloadAction<ValidCheckInState>) {
      state.type = action.payload.type;
      state.isVehicle = action.payload.isVehicle;
      state.VisitDetailId = action.payload.VisitDetailId;
      state.SecurityInId = action.payload.SecurityInId;
      state.GateInId = action.payload.GateInId;
      state.QrCardVerification = action.payload.QrCardVerification;
      state.CredentialCard = action.payload.CredentialCard;
      state.Images = action.payload.Images;
      state.VehicleSession = action.payload.VehicleSession;
    },
    resetValidCheckIn(state) {
      state.type = "QRCardVerified";
      state.isVehicle = false;
      state.VisitDetailId = 0;
      state.SecurityInId = 0;
      state.GateInId = 0;
      state.QrCardVerification = "";
      state.CredentialCard = null;
      state.Images = null;
      state.VehicleSession = null;
    },
    setType(state, action: PayloadAction<"CredentialCard" | "QRCardVerified">) {
      state.type = action.payload;
    },
    setIsVehicle(state, action: PayloadAction<boolean>) {
      state.isVehicle = action.payload;
    },
    setVisitDetailId(state, action: PayloadAction<number>) {
      state.VisitDetailId = action.payload;
    },
    setSecurityInId(state, action: PayloadAction<number>) {
      state.SecurityInId = action.payload;
    },
    setGateInId(state, action: PayloadAction<number>) {
      state.GateInId = action.payload;
    },
    setQRCardVerification(state, action: PayloadAction<string >) {
      state.QrCardVerification = action.payload;
    },
    setCredentialCard(state, action: PayloadAction<string | null>) {
      state.CredentialCard = action.payload;
    },
    setImages(state, action: PayloadAction<Images[] | null>) {
      state.Images = action.payload;
    },
    setVehicleSession(state, action: PayloadAction<VehicleSession | null>) {
      state.VehicleSession = action.payload;
    },
  },
});

export const {
  setValidCheckIn,
  resetValidCheckIn,
  setType,
  setIsVehicle,
  setVisitDetailId,
  setSecurityInId,
  setGateInId,
  setQRCardVerification,
  setCredentialCard,
  setImages,
  setVehicleSession,
} = validCheckInSlice.actions;
export default validCheckInSlice.reducer;