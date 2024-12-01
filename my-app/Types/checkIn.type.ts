


export interface Images {
    imageType: string;
    imageURL: string;
  }

  export interface CheckIn {
    visitDetailId: string;
    securityInId: number;
    gateInId: number;
    qrCardVerification: string;
    images: Images[];
}


export interface CheckInVer02 {
  CredentialCard: number | null;
  SecurityInId: number; 
  GateInId: number;
  QrCardVerification: string;
  Images: Array<{
    ImageType: string;
    ImageURL: string;
    Image: string;
  }>;
}

export interface CheckInVerWithLP {
  CredentialCard: number | null;
  SecurityInId: number; 
  GateInId: number;
  QrCardVerification: string;
  Images: Array<{
    ImageType: string;
    ImageURL: string;
    Image: string;
  }>;
  VehicleSession: {
    LicensePlate: string;
    vehicleImages: Array<{
      ImageType: string;
      ImageURL: string;
      Image: string;
    }>;
  };
}

export interface ValidCheckIn {
  CredentialCard: string | null;
  QRCardVerification: string;
  ImageShoe: any
}


  

  


  