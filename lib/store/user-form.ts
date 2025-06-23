// store.js
import { create } from 'zustand';
import { persist } from "zustand/middleware";
import { system } from '../ums/type';

export type FormData = {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  mobile: string;
  fms_branch: string[];
  tenantId: string;
  teams: string[];
  selected_systems: system[];
};

const initialFormData: FormData = {
  name: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  phone: "",
  mobile: "",
  fms_branch: [],
  tenantId: "",
  teams: [],
  selected_systems: [],
};

type FormStore = {
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: initialFormData,
      setFormData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            ...data,
          },
        })),
      resetForm: () => set({ formData: initialFormData }),
    }),
    {
      name: "user-form-data", // key in localStorage
    }
  )
);
