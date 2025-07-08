import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { branches, systemRoles } from "./data";
import { Branch, Team } from "./type";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTokenExpired(token: string): boolean {

  if (!token) {
    return true;
  }

  try {
    const decoded_token = jwtDecode<{ exp: number }>(token);

    if (!decoded_token) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return decoded_token.exp < currentTime;
  } catch (error) {
    console.error("Invalid token: ", token);
    return true;
  }
}
export function getBranchName(branchId: string): string {
  const branch = branches.find((branch: Branch) => branch.id === branchId);
  return branch ? branch.name : "Unknown Branch";
}

export function getRoleName(
  system: keyof typeof systemRoles,
  roleId: number | string
): string {
  return systemRoles[system].find((role) => role.roleId == roleId)?.name || "N/A";
}



export function getRoleId(roleName: string, system: keyof typeof systemRoles): number | string {
  const roleId = systemRoles[system].find((role) => role.name === roleName)?.roleId;
  return roleId !== undefined ? roleId : -1;
}

export function getIdByRoleType(roleType: string, system: keyof typeof systemRoles): number | string {
  const roleId = systemRoles[system].find((role: any) => role.role_type == roleType)?.roleId;
  return roleId !== undefined ? roleId : -1;
}