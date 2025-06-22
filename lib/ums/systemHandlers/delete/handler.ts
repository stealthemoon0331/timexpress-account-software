// app/lib/systemHandlers/delete/handler.ts
import {
    AMS_API_PATH,
    CRM_API_PATH,
    FMS_API_PATH,
    QCMS_API_PATH,
    TMS_API_PATH,
    WMS_API_PATH,
  } from "@/app/config/setting";
  import { user } from "@/lib/ums/type";
  
  interface DeleteParams {
    user: user;
    accessToken?: string;
  }
  
  export async function deleteUserFromFMS({ user, accessToken }: DeleteParams) {
    try {
      const response = await fetch(`${FMS_API_PATH}/api/deleteuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ delete_user_id: user.fms_user_id }),
      });
      console.log("FMS delete response ===> ", response);
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }
  
      return { success: true };
    } catch (error) {
      console.error("FMS deletion error:", error);
      return { success: false, error: "Failed to delete from FMS" };
    }
  }
  
  // Similar handlers for other systems
  export async function deleteUserFromWMS({ user, accessToken }: DeleteParams) {
    try {
      console.log("user.wms_user_id ==> ", user.wms_user_id)
      const response = await fetch(`${WMS_API_PATH}/api/users/${user.wms_user_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("WMS delete response ===> ", response);
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }
  
      return { success: true };
    } catch (error) {
      console.error("WMS deletion error:", error);
      return { success: false, error: "Failed to delete from WMS" };
    }
  }
  
  export async function deleteUserFromCRM({ user, accessToken }: DeleteParams) {
    try {
      console.log("user.crm_user_id ==> ", user.crm_user_id)

      const response = await fetch(`${CRM_API_PATH}/api/users/${user.crm_user_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("CRM delete response ===> ", response);
      let responseData: any = null;

      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
        console.log("responseData ==> ", responseData);
      } catch (jsonErr) {
        console.warn("Failed to parse response JSON:", jsonErr);
      }

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }
  
      return { success: true };
    } catch (error) {
      console.error("CRM deletion error:", error);
      return { success: false, error: "Failed to delete from CRM" };
    }
  }
  
  export async function deleteUserFromTMS({ user, accessToken }: DeleteParams) {
    try {
      console.log("user.tms_user_id ==> ", user.tms_user_id)

      const response = await fetch(
        `${TMS_API_PATH}/shypvdriverapp/personnel/deletePersonnel`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ personnel_id: user.tms_user_id }),
        }
      );
      console.log("TMS delete response ===> ", response);
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }
  
      return { success: true };
    } catch (error) {
      console.error("TMS deletion error:", error);
      return { success: false, error: "Failed to delete from TMS" };
    }
  }

  export async function deleteUserFromAMS({ user }: DeleteParams) {
    try {
      console.log("user.ams_user_id ==> ", user.ams_user_id)

      const response = await fetch(
        `${AMS_API_PATH}/api/auth/user?id=${user.ams_user_id}`,
        {
          method: "DELETE",
        }
      );
      console.log("AMS delete response ===> ", response);
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }
  
      return { success: true };
    } catch (error) {
      console.error("AMS deletion error:", error);
      return { success: false, error: "Failed to delete from AMS" };
    }
  }

    export async function deleteUserFromQCMS({ user }: DeleteParams) {
    try {
      console.log("user.qcms_user_id ==> ", user.qcms_user_id)

      const response = await fetch(
        `${QCMS_API_PATH}/api/auth/user?id=${user.qcms_user_id}`,
        {
          method: "DELETE",
        }
      );
      console.log("QCMS delete response ===> ", response);
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }
  
      return { success: true };
    } catch (error) {
      console.error("QCMS deletion error:", error);
      return { success: false, error: "Failed to delete from QCMS" };
    }
  }