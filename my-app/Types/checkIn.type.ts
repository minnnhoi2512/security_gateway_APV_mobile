


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

  

  


  