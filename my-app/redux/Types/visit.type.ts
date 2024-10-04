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
    expectedStartHour: string;
    expectedEndHour: string;
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


  export interface Visit2 {
    visitId: number;
    visitName: string;
    visitQuantity: number;
    description: string | null;
    createByname: string;
    scheduleTypeName: string;
  }
  