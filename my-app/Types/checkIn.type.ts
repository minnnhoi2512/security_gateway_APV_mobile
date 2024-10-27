


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
  VisitDetailId: number;
  SecurityInId: number; 
  GateInId: number;
  QrCardVerification: string;
  Images: Array<{
    ImageType: string;
    ImageURL: string;
    Image: string;
  }>;
}

  

  


  