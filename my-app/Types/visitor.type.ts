interface Visitor {
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  credentialsCard: string;
  credentialCardTypeId: number;
  visitorCredentialFrontImageFromRequest?: string | null; 
  visitorCredentialBackImageFromRequest?: string | null;  
}