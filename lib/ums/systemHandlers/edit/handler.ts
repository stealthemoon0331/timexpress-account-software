import {
  CRM_API_PATH,
  FMS_API_PATH,
  TMS_API_PATH,
  WMS_API_PATH,
} from "@/app/config/setting";
import { systemRoles } from "@/lib/ums/data";
import { system } from "@/lib/ums/type";
import { getRoleName } from "@/lib/ums/utils";

interface UpdateParams {
  formData: any;
  roleId: number;
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
    
    if(Number(responseData?.status) === 200) {
      responseData.roleId = roleId;
     }
    
    if(Number(responseData?.status) === 404) {
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
          tenant_id:"1234wew",
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
  
    if (!response.ok ) {
      if(Number(response?.status) == 500) {
        return {
          isError: true,
          message: responseData.message || "TMS Server Error : Failed to update user",
          data: null,
        };
      }
      
      if(Number(response?.status) == 404) {
        return {
          isError: true,
          message: "TMS : User not found",
          data: null,
        };
      }
      if(Number(response?.status) == 403) {
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
