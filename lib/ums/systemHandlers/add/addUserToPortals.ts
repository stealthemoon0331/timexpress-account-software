import { FormUser, SelectedSystemRoles, system } from "../../type";
import { getRoleId } from "../../utils";

export const addUserToPortals = async (
  user: any,
  systemsToRegister: system[],
  seletectedSystemRoles: SelectedSystemRoles,
  keycloakAccessToken: string | null,
  selectedAccessForTMS: string | undefined,
  selectedBranchesForFMS: string[]
) => {
  try {
    //Initialize users'id...
    const ssoUser = {
      ...user,
      systems: systemsToRegister.map((system) => ({
        name: system,
        roleId: getRoleId(
          seletectedSystemRoles[system as keyof typeof seletectedSystemRoles],
          system
        ),
      })),
      branch: selectedBranchesForFMS,
      //@ts-ignore
      teams: user.teams.filter((team) => team !== ""),
    };

    let fms_user_id = -1;
    let crm_user_id = -1;
    let wms_user_id = -1;
    let tms_user_id = -1;
    let ams_user_id = -1;
    let qcms_user_id = -1;
    let tsms_user_id = -1;
    let tdms_user_id = -1;

    let registered_system: any[] = [];
    let countsOfRegisteredSystem = 0;

    // Register user into portal systems...

    const results = await Promise.allSettled(
      systemsToRegister.map(async (system) => {
        const response = await fetch(`/api/ums/systems/add/${system}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ssoUser: ssoUser,
            systemRoleSelections: seletectedSystemRoles,
            accessToken: keycloakAccessToken,
            selectedAccess: selectedAccessForTMS,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.message);
        }

        const responseData = await response.json();

        if (responseData.error) {
          //   hotToast.error(responseData.message, { duration: 5000 });
          throw new Error(responseData.message);
        }

        return responseData.data;
      })
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const val = result.value;

        if (val.system === "FMS") fms_user_id = val.userid;
        else if (val.system === "WMS") wms_user_id = val.userid;
        else if (val.system === "CRM") crm_user_id = val.userid;
        else if (val.system === "TMS") tms_user_id = val.userid;
        else if (val.system === "AMS") ams_user_id = val.userid;
        else if (val.system === "QCMS") qcms_user_id = val.userid;
        else if (val.system === "TSMS") tsms_user_id = val.userid;
        else if (val.system === "TDMS") tdms_user_id = val.userid;

        registered_system.push(val.system);
        countsOfRegisteredSystem++;
      }
    });

    if (registered_system.length === 0) {
      return {
        success: false,
        error: "User was not registered at any system.",
      };
    }

    // After register user into portal and then register into ums database...
    const newUser = {
      name: ssoUser.name,
      email: ssoUser.email,
      username: ssoUser.username,
      password: ssoUser.password,
      phone: ssoUser.phone,
      mobile: ssoUser.mobile,
      tenantId: ssoUser.tenantId,
      fms_user_id: registered_system.includes("FMS") ? fms_user_id : -1,
      fms_branch: registered_system.includes("FMS")
        ? selectedBranchesForFMS
        : [],
      fms_user_role_id: registered_system.includes("FMS")
        ? getRoleId(seletectedSystemRoles["FMS"], "FMS")
        : -1,
      wms_user_id: registered_system.includes("WMS") ? wms_user_id : -1,
      wms_user_role_id: registered_system.includes("WMS")
        ? getRoleId(seletectedSystemRoles["WMS"], "WMS")
        : -1,
      crm_user_id: registered_system.includes("CRM") ? crm_user_id : -1,
      crm_user_role_id: registered_system.includes("CRM")
        ? getRoleId(seletectedSystemRoles["CRM"], "CRM")
        : -1,
      tms_user_id: registered_system.includes("TMS") ? tms_user_id : -1,
      tms_user_role_id: registered_system.includes("TMS")
        ? getRoleId(seletectedSystemRoles["TMS"], "TMS")
        : -1,
      ams_user_id: registered_system.includes("AMS") ? ams_user_id : -1,
      ams_user_role_id: registered_system.includes("AMS")
        ? getRoleId(seletectedSystemRoles["AMS"], "AMS")
        : -1,
      qcms_user_id: registered_system.includes("QCMS") ? qcms_user_id : -1,
      qcms_user_role_id: registered_system.includes("QCMS")
        ? getRoleId(seletectedSystemRoles["QCMS"], "QCMS")
        : -1,
      tsms_user_id: registered_system.includes("TSMS") ? tsms_user_id : -1,
      tsms_user_role_id: registered_system.includes("TSMS")
        ? getRoleId(seletectedSystemRoles["TSMS"], "TSMS")
        : -1,
      tdms_user_id: registered_system.includes("TDMS") ? tdms_user_id : -1,
      tdms_user_role_id: registered_system.includes("TDMS")
        ? getRoleId(seletectedSystemRoles["TDMS"], "TDMS")
        : -1,
      selected_systems: registered_system,
      systems_with_permission: registered_system,
      access: registered_system.includes("TMS") ? selectedAccessForTMS : "0",
      teams: registered_system.includes("TMS")
        ? // @ts-ignore
          ssoUser.teams.filter((team) => team !== "")
        : [""],
    };

    const umsResponse = await fetch(`/api/ums/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    if (!umsResponse.ok) {
      const errorBody = await umsResponse.json();
      throw new Error(errorBody.message || "Failed to register user in UMS");
    }

    const umsData = await umsResponse.json();

    return {
      success: true,
      data: umsData,
      warning:
        registered_system.length < systemsToRegister.length
          ? "Failed to register user for some systems."
          : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error occured",
    };
  }
};
