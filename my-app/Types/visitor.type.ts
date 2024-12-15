interface Visitor {
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  credentialsCard: string;
  credentialCardTypeId: number;
  visitorCredentialFrontImageFromRequest?: string | null; 
  visitorCredentialBackImageFromRequest?: string | null;  
  visitorCredentialBlurImageFromRequest?: string | null;  
}