export interface Visitor {
    visitorId: number;
    visitorName: string;
    companyName: string;
    phoneNumber: string;
    credentialsCard: string;
    visitorCredentialImage: string;
    status: string;
  }
  
  export interface Visit {
    visitId: number;
    visitName: string;
    visitQuantity: number;
    createByname: string | null;
    scheduleTypeName: string;
  }
  
  export interface VisitDetail {
    visitDetailId: number;
    expectedStartHour: string;
    expectedEndHour: string;
    status: boolean;
    visitor: Visitor;
    visit: Visit;
  }
  