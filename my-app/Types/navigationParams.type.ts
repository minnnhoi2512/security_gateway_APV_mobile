export interface UserDetailParams {
    data: scanData;
  }


  export interface scanData {
    id: string;
    nationalId: string;
    name: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    issueDate: string;
  }