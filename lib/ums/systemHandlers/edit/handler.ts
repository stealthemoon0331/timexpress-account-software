import {
  AMS_API_PATH,
  CRM_API_PATH,
  FMS_API_PATH,
  QCMS_API_PATH,
  TMS_API_PATH,
  TSMS_API_PATH,
  WMS_API_PATH,
} from "@/app/config/setting";
import { systemRoles } from "@/lib/ums/data";
import { system } from "@/lib/ums/type";
import { getRoleName } from "@/lib/ums/utils";

interface UpdateParams {
  formData: any;
  roleId: number | string;
  accessToken?: string;
  selectedAccess?: any;
  user: any;
  system: system;
}

export async function updateUserInFMS({
  formData,
  roleId,
  accessToken,
  user,
  system,
}: UpdateParams) {
  try {
    const response = await fetch(`${FMS_API_PATH}/api/updateuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //   Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        user_id: user.fms_user_id,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        fms_branch: formData.fms_branch,
        roleId: roleId,
        tenantId: formData.tenantId,
        status: 1,
      }),
    });

    let responseData: any = null;

    try {
      // Try to parse response only if there is content
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};

    } catch (jsonErr) {
      console.warn("Failed to parse response JSON:", jsonErr);
    }

    // const responseData = await response.json();

    if (Number(responseData?.status) === 200) {
      responseData.roleId = roleId;
    }

    if (Number(responseData?.status) === 404) {
      return {
        isError: true,
        message: "FMS : " + responseData.message || "Failed to update user in FMS",
        data: null,
      };
    }

    if (!response.ok && Number(responseData?.status) == 500) {
      return {
        isError: true,
        message: responseData.message || "Failed to update user in FMS",
        data: null,
      };
    }

    return {
      isError: false,
      message: "FMS user updated successfully",
      system: system,
      data: responseData,
    };
  } catch (error) {
    console.error("FMS update error:", error);
    return {
      isError: true,
      message: "Failed to update user in FMS",
      data: null,
    };
  }
}

export async function updateUserInWMS({
  formData,
  roleId,
  accessToken,
  user,
  system,
}: UpdateParams) {
  try {
    console.log("system : ", system);
    console.log("roleId : ", roleId);

    console.log("updateParam : ", {
      ...formData,
      role: {
        id: roleId,
        role: getRoleName(system, roleId),
      },
    })

    const response = await fetch(
      `${WMS_API_PATH}/api/users/${user.wms_user_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify({
          ...formData,
          tenant_id: user.tenantId,
          role: {
            id: roleId,
            role: getRoleName(system, roleId),
          },
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok && responseData.status == 500) {
      return {
        isError: true,
        message: responseData.message || "Failed to update user in WMS",
        data: null,
      };
    }

    return {
      isError: false,
      message: "WMS user updated successfully",
      system: system,
      data: responseData,
    };
  } catch (error) {
    console.error("WMS update error:", error);
    return {
      isError: true,
      message: "Failed to update user in WMS",
      data: null,
    };
  }
  // WMS update implementation
}

export async function updateUserInCRM({
  formData,
  roleId,
  accessToken,
  user,
  system,
}: UpdateParams) {
  // CRM update implementation
  try {

    const response = await fetch(
      `${CRM_API_PATH}/api/users/edituser/${user.crm_user_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify({
          ...formData,
          role_id: roleId,
        }),
      }
    );
    let responseData: any = null;
    try {
      // Try to parse response only if there is content
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
    } catch (jsonErr) {
      console.warn("Failed to parse response JSON:", jsonErr);
    }

    if (!response.ok) {
      if (response.status === 401) {
        return {
          isError: true,
          message:
            responseData?.message ||
            `You dont have permission to update user in CRM`,
          data: null,
        };
      }
      return {
        isError: true,
        message: responseData || `Failed to update user in CRM`,
        data: null,
      };
    }

    return {
      isError: false,
      message: "CRM user updated successfully",
      system: system,
      data: responseData,
    };
  } catch (error) {
    console.error("CRM update error:", error, " : ", typeof error);

    return {
      isError: true,
      message: error instanceof Error ? error.message : String(error),
      data: null,
    };
  }
}

export async function updateUserInTMS({
  formData,
  roleId,
  accessToken,
  user,
  selectedAccess,
  system,
}: UpdateParams) {
  try {
    const passVal = {
      personnel_id: formData.tms_user_id,
      personnel_name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      teams: formData.teams, // Assume this is an array of team IDs
      role: systemRoles["TMS"].find((role) => role.roleId === roleId)
        ?.role_type,
      access: selectedAccess,
      updated_by: 2, // Assuming "2" is the ID of the current user making the request
    };

    const response = await fetch(
      `${TMS_API_PATH}/shypvdriverapp/personnel/updatePersonnel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify(passVal),
      }
    );

    let responseData: any = null;
    try {
      // Try to parse response only if there is content
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
    } catch (jsonErr) {
      console.warn("Failed to parse response JSON:", jsonErr);
    }

    if (!response.ok) {
      if (Number(response?.status) == 500) {
        return {
          isError: true,
          message: responseData.message || "TMS Server Error : Failed to update user",
          data: null,
        };
      }

      if (Number(response?.status) == 404) {
        return {
          isError: true,
          message: "TMS : User not found",
          data: null,
        };
      }
      if (Number(response?.status) == 403) {
        return {
          isError: true,
          message: responseData.message || "TMS : You dont have permission to update user",
          data: null,
        };
      }
    }

    return {
      isError: false,
      message: "TMS user updated successfully",
      system: system,
      data: responseData,
    };
  } catch (error) {
    console.error("TMS update error:", error);
    return {
      isError: true,
      message: "Failed to update user in TMS",
      data: null,
    };
  }
}

export async function updateUserInAMS({
  formData,
  roleId,
  accessToken,
  user,
  system,
}: UpdateParams) {
  // CRM update implementation
  try {

    console.log("formData from updateUserAMS => ", formData)

    if(!user.ams_user_id) {
      throw new Error("Update field. Your data was not initialized");
    } 

    let updateBody = {}

    if (formData.email) {
      updateBody = { ...updateBody, email: formData.email };
    }

    if (formData.name) {
      updateBody = { ...updateBody, name: formData.name };
    }

    if(roleId) {
      updateBody = {...updateBody, role: roleId}
    }

    console.log("updateBody from edit handler => ", updateBody);

    const response = await fetch(
      `${AMS_API_PATH}/api/auth/user?id=${user.ams_user_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody)
      }
    );
    let responseData: any = null;
    try {
      // Try to parse response only if there is content
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};

      console.log("responseData => ", responseData);
    } catch (jsonErr) {
      console.warn("Failed to parse response JSON:", jsonErr);
    }

    if (!response.ok) {
      if (response.status === 401) {
        return {
          isError: true,
          message:
            responseData?.message ||
            `You dont have permission to update user in AMS`,
          data: null,
        };
      }
      return {
        isError: true,
        message: responseData || `Failed to update user in AMS`,
        data: null,
      };
    }

    return {
      isError: false,
      message: "AMS user updated successfully",
      system: system,
      data: responseData,
    };
  } catch (error) {
    console.error("AMS update error:", error, " : ", typeof error);

    return {
      isError: true,
      message: error instanceof Error ? error.message : String(error),
      data: null,
    };
  }
}

export async function updateUserInQCMS({
  formData,
  roleId,
  accessToken,
  user,
  system,
}: UpdateParams) {
  // CRM update implementation
  try {

    console.log("formData from updateUserInQCMS => ", formData)

    if(!user.qcms_user_id) {
      throw new Error("Update field. Your data was not initialized");
    } 

    let updateBody = {}

    if (formData.email) {
      updateBody = { ...updateBody, email: formData.email };
    }

    if (formData.name) {
      updateBody = { ...updateBody, name: formData.name };
    }

    if(roleId) {
      updateBody = {...updateBody, role: roleId}
    }

    console.log("updateBody from edit handler => ", updateBody);

    const response = await fetch(
      `${QCMS_API_PATH}/api/auth/user?id=${user.qcms_user_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody)
      }
    );
    let responseData: any = null;

    console.log("QCMS response => ", response);

    try {
      // Try to parse response only if there is content
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
    } catch (jsonErr) {
      console.warn("Failed to parse response JSON:", jsonErr);
    }

    if (!response.ok) {
      
      return {
        isError: true,
        message: responseData.msg || `Failed to update user in QCMS`,
        data: null,
      };
    }

    return {
      isError: false,
      message: "QCMS user updated successfully",
      system: system,
      data: responseData.user,
    };
  } catch (error) {
    console.error("QCMS update error:", error, " : ", typeof error);

    return {
      isError: true,
      message: error instanceof Error ? error.message : String(error),
      data: null,
    };
  }
}

export async function updateUserInTSMS({
  formData,
  roleId,
  accessToken,
  user,
  system,
}: UpdateParams) {
  // CRM update implementation
  try {

    console.log("formData from updateUserInTSMS => ", formData)

    if(!user.tsms_user_id) {
      throw new Error("Update field. Your data was not initialized");
    } 

    let updateBody = {}

    if (formData.email) {
      updateBody = { ...updateBody, email: formData.email };
    }

    if (formData.name) {
      updateBody = { ...updateBody, name: formData.name };
    }

    if(roleId) {
      updateBody = {...updateBody, role: roleId}
    }

    console.log("updateBody from edit handler => ", updateBody);

    const response = await fetch(
      `${TSMS_API_PATH}/api/auth/user?id=${user.tsms_user_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody)
      }
    );
    let responseData: any = null;

    console.log("QCMS response => ", response);

    try {
      // Try to parse response only if there is content
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
    } catch (jsonErr) {
      console.warn("Failed to parse response JSON:", jsonErr);
    }

    if (!response.ok) {
      
      return {
        isError: true,
        message: responseData.msg || `Failed to update user in QCMS`,
        data: null,
      };
    }

    return {
      isError: false,
      message: "TSMS user updated successfully",
      system: system,
      data: responseData.user,
    };
  } catch (error) {
    console.error("TSMS update error:", error, " : ", typeof error);

    return {
      isError: true,
      message: error instanceof Error ? error.message : String(error),
      data: null,
    };
  }
}