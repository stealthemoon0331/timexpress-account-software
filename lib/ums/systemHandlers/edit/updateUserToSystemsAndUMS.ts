import { FormUser, SelectedSystemRoles, system } from "../../type";
import { getRoleId } from "../../utils";

export const updateUserToSystemsAndUMS = async (
  user: any,
  formData: any,
  systemsToRegister: system[],
  seletectedSystemRoles: SelectedSystemRoles,
  keycloakAccessToken: string | null,
  selectedAccessForTMS: string | undefined,
  selectedBranchesForFMS: string[]
) => {

};
