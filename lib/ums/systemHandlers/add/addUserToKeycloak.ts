// import { FormUser, SelectedSystemRoles, system } from "../../type";
// import { getRoleId } from "../../utils";

// export const addUserToSystemsAndUMS = async (
//   user: FormUser,
//   systemsToRegister: system[],
//   seletectedSystemRoles: SelectedSystemRoles,
//   keycloakAccessToken: string | null,
//   selectedAccessForTMS: string | undefined,
//   selectedBranchesForFMS: string[]
// ) => {
//   try {
//     //Initialize users'id...
//     const ssoUser = {
//       ...user,
//       systems: systemsToRegister.map((system) => ({
//         name: system,
//         roleId: getRoleId(
//           seletectedSystemRoles[system as keyof typeof seletectedSystemRoles],
//           system
//         ),
//       })),
//       teams: user.teams.filter((team) => team !== ""),
//     };

//     let fms_user_id = -1;
//     let crm_user_id = -1;
//     let wms_user_id = -1;
//     let tms_user_id = -1;
//     let registered_system: any[] = [];
//     let countsOfRegisteredSystem = 0;

//     let returnData = {};

//     // Register user into portal systems...

//     const results = await Promise.allSettled(
//       systemsToRegister.map(async (system) => {
//         const response = await fetch(`/api/ums/systems/add/${system}`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             ssoUser: ssoUser,
//             systemRoleSelections: seletectedSystemRoles,
//             accessToken: keycloakAccessToken,
//             selectedAccess: selectedAccessForTMS,
//           }),
//         });
//         const responseData = await response.json();
//         if (!response.ok) {
//           const error = await response.json();
//           throw new Error(error.message);
//         }

//         if (responseData.error) {
//           hotToast.error(responseData.message, { duration: 5000 });
//           throw new Error(responseData.message);
//         }

//         return responseData.data;
//       })
//     );

//     results.forEach((result) => {
//       if (result.status === "fulfilled") {
//         if (result.value.system === "FMS") {
//           fms_user_id = result.value.userid;
//         } else if (result.value.system === "WMS") {
//           wms_user_id = result.value.userid;
//         } else if (result.value.system === "CRM") {
//           crm_user_id = result.value.userid;
//         } else if (result.value.system === "TMS") {
//           tms_user_id = result.value.userid;
//         }
//         registered_system.push(result.value.system);
//         countsOfRegisteredSystem++;
//       }
//     });

//      if (countsOfRegisteredSystem < systemsToRegister.length) {
//     toastify.warn("Failed to register user for all systems.", {
//       autoClose: 3000,
//     });
//   }

//   // After register user into portal and then register into ums database...
//   if (registered_system.length > 0) {
//     const newUser = {
//       name: ssoUser.name,
//       email: ssoUser.email,
//       username: ssoUser.username,
//       password: ssoUser.password,
//       phone: ssoUser.phone,
//       mobile: ssoUser.mobile,
//       fms_user_id: registered_system.includes("FMS") ? fms_user_id : -1,
//       fms_branch: registered_system.includes("FMS")
//         ? selectedBranchesForFMS
//         : [],
//       fms_user_role_id: registered_system.includes("FMS")
//         ? getRoleId(seletectedSystemRoles["FMS"], "FMS")
//         : -1,
//       wms_user_id: registered_system.includes("WMS") ? wms_user_id : -1,
//       wms_user_role_id: registered_system.includes("WMS")
//         ? getRoleId(seletectedSystemRoles["WMS"], "WMS")
//         : -1,
//       crm_user_id: registered_system.includes("CRM") ? crm_user_id : -1,
//       crm_user_role_id: registered_system.includes("CRM")
//         ? getRoleId(seletectedSystemRoles["CRM"], "CRM")
//         : -1,
//       tms_user_id: registered_system.includes("TMS") ? tms_user_id : -1,
//       tms_user_role_id: registered_system.includes("TMS")
//         ? getRoleId(seletectedSystemRoles["TMS"], "TMS")
//         : -1,
//       selected_systems: registered_system,
//       systems_with_permission: registered_system,
//       access: registered_system.includes("TMS") ? selectedAccessForTMS : "0",
//       teams: registered_system.includes("TMS")
//         ? ssoUser.teams.filter((team) => team !== "")
//         : [""],
//     };

//     fetch(`/api/ums/customers`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(newUser),
//     })
//       .then(async (response) => {
//         if (response.ok) {
//           const data = await response.json();
//           addNewUser(data);

//           toastify.success("Regiserted new user into UMS!", {
//             autoClose: 3000,
//           });
//         }
//       })
//       .catch((error) => {
//         console.error("Error creating user:", error);
//         hotToast.error("Error creating user...", {
//           duration: 3000,
//         });
//         setIsSending(false);
//       });
//   } else {
//     hotToast.error("User was not registered at any system.", {
//       duration: 5000,
//     });
//   }

//   return returnData;

//   } catch (error) {
//     // console.error("Error fetching user data:", error);
//     hotToast.error("Failed to register user for all systems.", {
//       duration: 5000,
//     });
//   }

 

  
// };
