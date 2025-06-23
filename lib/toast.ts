import { toast } from "sonner"; // or "react-hot-toast"

export const notifySuccess = (message: string) => {
  toast.success(message);
};

export const notifyError = (message: string) => {
  toast.error(message);
};

export const notifyWarning = (message: string) => {
  toast.warning?.(message) ||
    toast(message, { style: { background: "#facc15" } }); // fallback
};
