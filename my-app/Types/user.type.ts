export interface Staff {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  image: string;
  createdDate: string;
  updatedDate: string;
  status: string;
  role: Role;
  department: Department;
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface UpdateUserProfile {
  fullName: string;
  phoneNumber: string;
  email: string;
}

// export interface UserProfile {
//   id: string;
//   name: string;
//   image: string;
//   email: string;
// }

 
 
export interface UserRole {
  roleId: number;
  roleName: string;
}

export interface UserProfile {
  userId: number;  
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  image: string;  
  createdDate: string;  
  updatedDate: string;  
  status: string;
  role: UserRole; 
  department: string | null;  
}

