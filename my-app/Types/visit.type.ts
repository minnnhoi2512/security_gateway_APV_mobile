export interface Visitor {
    companyName: string;
    credentialsCard: string;
    phoneNumber: string;
    status: string; 
  }
  
  export interface Visit {
    visitId: string;
    visitName: string;
    visitQuantity: number;
  }
  
  export interface VisitDetails {
    expectedEndHour: string; 
    expectedStartHour: string; 
    status: string; 
    visitDetailId: string;
    visit: Visit;
    visitor: Visitor;
  }
  

  export type VisitUser = VisitDetails[];
  