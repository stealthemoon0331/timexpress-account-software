export type Branch = {
  id: string;
  name: string;
};

export type Team = {
  teamId: number;
  teamName: string;
  shortCode: string;
  city: string;
  createdBy: number;
};

export type system = "CRM" | "WMS" | "FMS" | "TMS";

export interface FailedSystem {
  userId: number;
  systems: system[];
}

export interface PermissionedSystem {
  userId: number;
  systems: system[];
}

export interface DecodedToken {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  iat: number; // issued at
  exp: number; // expiration time
}

export type user = {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  mobile: string;
  fms_user_id: number;
  fms_branch: string[];
  fms_user_role_id: number;
  wms_user_id: number;
  wms_user_role_id: number;
  crm_user_id: number;
  crm_user_role_id: number;
  tms_user_id: number;
  tms_user_role_id: number;
  selected_systems: system[];
  systems_with_permission: system[];
  access: string;
  teams: string[];
};

export type FormUser = {  
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  mobile: string;
  fms_user_id: number;
  fms_branch: string[];
  fms_user_role_id: number;
  wms_user_id: number;
  wms_user_role_id: number;
  crm_user_id: number;
  crm_user_role_id: number;
  tms_user_id: number;
  tms_user_role_id: number;
  selected_systems: system[];
  systems_with_permission: system[];
  access: string;
  teams: string[];
};

export type ErrorResponse = {
  error: boolean;
  message: string;
};
