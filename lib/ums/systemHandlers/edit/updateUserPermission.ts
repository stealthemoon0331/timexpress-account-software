import { _success } from "zod/v4/core";
import { system } from "../../type";

export const updateUserPermission = async (id: number, systems_with_permission: system[]) => {
  try {

    if(!id) {
        return {
            success: false,
            message: "Select user correctly."
        }
    }
    const res = await fetch(`/api/ums/customers/update-permission/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systems_with_permission,
      }),
    });

    const resData = await res.json();

    if(!res.ok) {
        throw new Error(resData.message || `Server Error: ${resData.status}`)
    }

    return {success: true, message: resData.message};
  } catch (error) {
    return {success: false, message: error || "Failed to update permission"}
  } 
};
