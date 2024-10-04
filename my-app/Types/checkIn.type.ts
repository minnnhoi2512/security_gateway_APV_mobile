


export interface Images {
    imageType: string;
    imageURL: string;
  }

  export interface CheckIn {
    visitDetailId: number;
    securityInId: number;
    gateInId: number;
    qrCardVerification: string;
    images: Images[];
}

  

  


  