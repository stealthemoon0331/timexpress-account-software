// app/lib/systemHandlers/delete/handler.ts
import {
  AMS_API_PATH,
  CRM_API_PATH,
  FMS_API_PATH,
  QCMS_API_PATH,
  TDMS_API_PATH,
  TMS_API_PATH,
  TSMS_API_PATH,
  WMS_API_PATH,
  HR_API_PATH,
  CHATESS_API_PATH,
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
    const response = await fetch(
      `${WMS_API_PATH}/api/users/${user.wms_user_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
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
    const response = await fetch(
      `${CRM_API_PATH}/api/users/${user.crm_user_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let responseData: any = null;

    try {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
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
    const response = await fetch(
      `${AMS_API_PATH}/api/auth/user?id=${user.ams_user_id}`,
      {
        method: "DELETE",
      }
    );

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
    const response = await fetch(
      `${QCMS_API_PATH}/api/auth/user?id=${user.qcms_user_id}`,
      {
        method: "DELETE",
      }
    );

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

export async function deleteUserFromTSMS({ user }: DeleteParams) {
  try {
    const response = await fetch(
      `${TSMS_API_PATH}/api/auth/user?id=${user.tsms_user_id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("TSMS deletion error:", error);
    return { success: false, error: "Failed to delete from TSMS" };
  }
}

export async function deleteUserFromTDMS({ user }: DeleteParams) {
  try {
    const response = await fetch(
      `${TDMS_API_PATH}/api/auth/user?id=${user.tdms_user_id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("TDMS deletion error:", error);
    return { success: false, error: "Failed to delete from TDMS" };
  }
}

export async function deleteUserFromHR({ user }: DeleteParams) {
  try {
    const response = await fetch(
      `${HR_API_PATH}/api/auth/user?id=${user.hr_user_id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("HR deletion error:", error);
    return { success: false, error: "Failed to delete from HR" };
  }
}

export async function deleteUserFromCHATESS({ user }: DeleteParams) {
  try {
    console.log("* user.chatess_user_id => ", user.chatess_user_id);
    console.log("delete api", {
      method: "DELETE",
      body: JSON.stringify({ id: 11 }),
    });
    const response = await fetch(`${CHATESS_API_PATH}/api/admin/users/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: user.chatess_user_id }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("CHATESS deletion error:", error);
    return { success: false, error: "Failed to delete from CHATESS" };
  }
}
