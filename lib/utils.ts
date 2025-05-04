import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Plan } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isPlanExpired = (expiresAt?: string | null | undefined) => {
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
};


export const getPlanTitle = (plans: Plan[], planId?: string | null | undefined) => {
  return plans.find((p) => p.id === planId)?.name
}