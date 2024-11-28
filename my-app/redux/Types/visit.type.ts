export interface Visitor {
  visitorId: number;
  visitorName: string;
  companyName: string;
  phoneNumber: string;
  createdDate: string;
  updatedDate: string;
  credentialsCard: string;
  credentialCardType: string | null;
  visitorCredentialImage: string;
  status: string;
}

export interface VisitDetailType {
  visitDetailId: number;
  visitDetailName: string;
  expectedStartDate: string;
  expectedEndDate: string;
  expectedStartHour: string;
  expectedEndHour: string;
  status: boolean;
  sessionStatus: string;
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
  description?: string | null;
  createByname?: string;
  scheduleTypeName?: string;
  visitDetailStartTime?: string;
  visitDetailEndTime?: string;
  visitorSessionCheckedOutCount?: number;
  visitorSessionCheckedInCount?: number;
  visitorCheckkInCount?: number;
  visitorCheckOutedCount?: number;
}
