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

export interface CreateVisit {
  visitName: string;
  visitQuantity: number;
  expectedStartTime: string;
  expectedEndTime: string;
  createById: number;
  description: string;
  scheduleId: number;
  visitDetail: Array<{
    expectedStartHour: string;
    expectedEndHour: string;
    visitorId: number;
  }>;
}

export type VisitUser = VisitDetails[];
