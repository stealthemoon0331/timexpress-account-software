import { FormUser, SelectedSystemRoles, system, user } from "../../type";
import { getIdByRoleType, getRoleId } from "../../utils";

export const updateUserToPortals = async (
  formData: any,
  systemsToUpdate: system[],
  systemRoleSelections: SelectedSystemRoles,
  keycloakAccessToken: string | null,
  selectedAccessForTMS: string | undefined,
  userToBeUpdated: any
) => {
  let countsOfUpdatedSystem = 0;
  let updated_systems: system[] = [];

  let fms_user_role_id = -1;
  let crm_user_role_id = -1;
  let wms_user_role_id = -1;
  let tms_user_role_id = -1;
  let ams_user_role_id = -1;
  let qcms_user_role_id = -1;
  

  console.log("formData in updateUserToPortals => ", formData)

  try {
    const results = await Promise.allSettled(
      systemsToUpdate.map(async (system) => {
        const response = await fetch(`/api/ums/systems/edit/${system}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData,
            systemRoleSelections,
            accessToken: keycloakAccessToken,
            selectedTmsAccess: selectedAccessForTMS,
            user: userToBeUpdated,
          }),
        });

        const responseData = await response.json();
        if (!response.ok || responseData.isError) {
          throw new Error(responseData.message || "Update failed");
        }
        return responseData;
      })
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        updated_systems.push(result.value.system);

        console.log("result => ", result);

        if (result.value.system === "FMS") {
          fms_user_role_id = result.value?.data?.roleId;
        }

        if (result.value.system === "CRM") {
          crm_user_role_id = result.value.data.role_id;
        }

        if (result.value.system === "WMS") {
          wms_user_role_id = result.value.data.role.id;
        }

        const role = result.value.data.data?.role;

        if (result.value.system === "TMS" && role) {
          tms_user_role_id = getIdByRoleType(role, "TMS") as number;
        }

        if (result.value.system === "AMS") {
          ams_user_role_id = result.value.data.role;
        }

        if (result.value.system === "QCMS") {
          qcms_user_role_id = result.value.data.role;
        }

        countsOfUpdatedSystem++;
        
      } else {
        // hotToast.error(result.reason.message);
        throw new Error(
          `${result.reason.message}` || `Failed update to system`
        );
      }
    });

    if (countsOfUpdatedSystem !== systemsToUpdate.length) {
      const failedSystems: system[] = systemsToUpdate.filter(
        (system) => !systemsToUpdate.includes(system)
      );
      throw new Error(`Failed to update ${failedSystems.join(", ")}`);
    }

    // Update user in the central SSO system
    const reqBody = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password
        ? formData.password
        : userToBeUpdated.password,
      phone: formData.phone,
      mobile: formData.mobile,
      fms_user_id: userToBeUpdated.fms_user_id,
      fms_branch: formData.fms_branch, //
      fms_user_role_id: updated_systems.includes("FMS")
        ? fms_user_role_id
        : userToBeUpdated.fms_user_role_id, //
      wms_user_id: userToBeUpdated.wms_user_id,
      wms_user_role_id: updated_systems.includes("WMS")
        ? wms_user_role_id
        : userToBeUpdated.wms_user_role_id, //
      crm_user_id: userToBeUpdated.crm_user_id,
      crm_user_role_id: updated_systems.includes("CRM")
        ? crm_user_role_id
        : userToBeUpdated.crm_user_role_id, //
      tms_user_id: userToBeUpdated.tms_user_id,
      tms_user_role_id: updated_systems.includes("TMS")
        ? tms_user_role_id
        : userToBeUpdated.tms_user_role_id, //
      ams_user_id: userToBeUpdated.ams_user_id,
      ams_user_role_id: updated_systems.includes("AMS")
        ? ams_user_role_id
        : userToBeUpdated.ams_user_role_id,
      qcms_user_id: userToBeUpdated.qcms_user_id,
      qcms_user_role_id: updated_systems.includes("QCMS")
      ? qcms_user_role_id
      : userToBeUpdated.qcms_user_role_id,
      selected_systems: userToBeUpdated.selected_systems, //
      systems_with_permission: updated_systems, //
      access: selectedAccessForTMS, //
      teams: formData.teams, //
    };

    const response = await fetch(`/api/ums/customers/${userToBeUpdated.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    if (response.ok) {
      // addUpdatedUser(updatedUserWithId);
      // onOpenChange(false);

      const updatedUserWithId = {
        ...reqBody,
        id: userToBeUpdated.id,
      };

      return {
        success: true,
        data: updatedUserWithId,
      };
    } else {
      throw new Error("Failed to update user");
    }
  } catch (error: any) {
    console.error("Error: ", error);

    return {
      success: false,
      error: error.message || "Unknown error occured",
    };
  }
};
