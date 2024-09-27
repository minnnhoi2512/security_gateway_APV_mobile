export interface Visitor {
    visitorName: string;
    companyName: string;
    phoneNumber: string;
    createdDate: string;
    updatedDate: string;
    credentialsCard: string;
    credentialCardType: string | null;
  }
  
  export interface VisitDetailType {
    visitDetailId: number;
    visitDetailName: string;
    expectedStartDate: string;
    expectedEndDate: string;
    expectedStartTime: string;
    expectedEndTime: string;
    status: boolean;
    visitor: Visitor;
  }
  
  export interface Visit {
    dateRegister: string;
    visitQuantity: number;
    acceptLevel: number;
    description: string | null;
    visitType: string;
    daysOfProcess: string;
    visitDetail: VisitDetailType[];
  }
  