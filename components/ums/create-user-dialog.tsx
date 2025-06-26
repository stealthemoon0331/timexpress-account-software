"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { accesses, branches, systemRoles } from "@/lib/ums/data";
import { X } from "lucide-react";
// import {
//   CRM_API_PATH,
//   FMS_API_PATH,
//   TMS_API_PATH,
//   WMS_API_PATH,
// } from "@/app/config/setting";
import {
  FormUser,
  SelectedSystemRoles,
  system,
  Team,
  user,
} from "@/lib/ums/type";
import { getBranchName, getRoleId, getRoleName } from "@/lib/ums/utils";
import { toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import InputWrapper from "./input-wrapper";
import { useData } from "@/app/contexts/dataContext";
import { addUserToPortals } from "@/lib/ums/systemHandlers/add/addUserToPortals";
import { useUser } from "@/app/contexts/UserContext";

interface CreateUserDialogProps {
  availableSystems: system[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addNewUser: (user: user) => void;
}

export function CreateUserDialog({
  availableSystems,
  open,
  onOpenChange,
  addNewUser,
}: CreateUserDialogProps) {
  const [selectedSystems, setSelectedSystems] = useState<system[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<string>();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState<FormUser>({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    tenant_id: "",
    phone: "",
    mobile: "",
    fms_user_id: -1,
    fms_branch: [""],
    fms_user_role_id: -1,
    wms_user_id: -1,
    wms_user_role_id: -1,
    crm_user_id: -1,
    crm_user_role_id: -1,
    tms_user_id: -1,
    tms_user_role_id: -1,
    ams_user_id: -1,
    ams_user_role_id: "",
    qcms_user_id: -1,
    qcms_user_role_id: "",
    tsms_user_id: -1,
    tsms_user_role_id: "",
    tdms_user_id: -1,
    tdms_user_role_id: "",
    selected_systems: [],
    access: "",
    teams: [""],
    systems_with_permission: [],
  });

  const { access_token, addUserToKeycloak } = useAuth();
  const { user: loggedUser } = useUser();
  const { teams } = useData();

  useEffect(() => {
    const updatedFormData = { ...formData };
    updatedFormData.fms_branch = selectedBranches;
    setFormData(updatedFormData);
  }, [selectedBranches]);

  useEffect(() => {
    const updatedFormData = { ...formData };
    updatedFormData.teams = selectedTeams;
    setFormData(updatedFormData);
  }, [selectedTeams]);

  // System-specific role selections
  const [systemRoleSelections, setSystemRoleSelections] =
    useState<SelectedSystemRoles>({
      CRM: "",
      WMS: "",
      FMS: "",
      TMS: "",
      AMS: "",
      QCMS: "",
      TSMS: "",
      TDMS: "",
    });

  const getTeamName = (teamId: string): string => {
    const team = teams.find((team: Team) => team.teamId === Number(teamId));
    return team ? team.teamName : "Unknown Team";
  };

  const handleSystemToggle = (system: system) => {
    setSelectedSystems((prev) =>
      prev.includes(system)
        ? prev.filter((s) => s !== system)
        : [...prev, system]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (system: string, roleName: string) => {
    setSystemRoleSelections((prev) => ({
      ...prev,
      [system]: roleName,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      { field: formData.username, message: "Please input username" },
      { field: formData.email, message: "Please input email" },
      { field: formData.password, message: "Please input password" },
      { field: formData.mobile, message: "Please input mobile number" },
      { field: formData.phone, message: "Please input phone number" },
    ];

    for (const { field, message } of requiredFields) {
      if (!field || field.trim() === "") {
        toastify.warn(message);
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toastify.warn("Passwords do not match");
      return false;
    }

    if (selectedSystems.length === 0) {
      toastify.warn("Please select a system");
      return false;
    }

    const systemRolesRequired: system[] = ["FMS", "WMS", "CRM", "TMS", "AMS", "QCMS", "TSMS", "TDMS"];

    for (const system of systemRolesRequired) {
      if (selectedSystems.includes(system) && !systemRoleSelections[system]) {
        toastify.warn(`Please select a role for ${system}`);
        return false;
      }
    }

    if (selectedSystems.includes("FMS") && selectedBranches.length === 0) {
      toastify.warn("Please select at least one branch");
      return false;
    }

    if (selectedSystems.includes("TMS")) {
      if (!selectedAccess) {
        toastify.warn("Please select access");
        return false;
      }

      const validTeams = formData.teams.filter((team) => team.trim() !== "");
      if (selectedAccess === "0" && validTeams.length === 0) {
        toastify.warn("Please select teams in TMS setting");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSending(true); // Set to true at the start of async operations

      const { username, email, password } = formData;

      const keycloakResponse = await addUserToKeycloak(
        username,
        email,
        password,
        selectedSystems
      );

      if (keycloakResponse.error) {
        throw new Error(keycloakResponse.message);
      }

      const updatedFormData = { ...formData, tenantId: loggedUser?.tenantId };

      const result = await addUserToPortals(
        updatedFormData,
        selectedSystems,
        systemRoleSelections,
        access_token,
        selectedAccess,
        selectedBranches
      );

      if (result.success) {
        addNewUser(result.data);
        toastify.success("Registered new user into UMS!", { autoClose: 3000 });

        if (result.warning) {
          toastify.warn(result.warning, { autoClose: 3000 });
        }

        // Reset form states
        resetForm();
      } else {
        throw new Error(result.error || "Failed to register user");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      hotToast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSending(false); // Always reset isSending in the end
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      tenant_id: loggedUser?.tenantId || "",
      phone: "",
      mobile: "",
      fms_user_id: -1,
      fms_branch: [],
      fms_user_role_id: -1,
      wms_user_id: -1,
      wms_user_role_id: -1,
      crm_user_id: -1,
      crm_user_role_id: -1,
      tms_user_id: -1,
      tms_user_role_id: -1,
      ams_user_id: -1,
      ams_user_role_id: "",
      qcms_user_id: -1,
      qcms_user_role_id: "",
      tsms_user_id: -1,
      tsms_user_role_id: "",
      tdms_user_id: -1,
      tdms_user_role_id: "",
      access: "",
      teams: [],
      selected_systems: [],
      systems_with_permission: [],
    });
    setSelectedBranches([]);
    setSelectedSystems([]);
    setSystemRoleSelections({
      FMS: "",
      WMS: "",
      CRM: "",
      TMS: "",
      AMS: "",
      QCMS: "",
      TSMS: "",
      TDMS: "",
    });
    setSelectedAccess("");
  };

  const cancelBranchSelection = (branch: string) => {
    setSelectedBranches((prev) => prev.filter((b) => b !== branch));
  };

  const cancelTeamSelection = (team: string) => {
    setSelectedTeams((prev) => prev.filter((b) => b !== team));
    setFormData((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t !== team),
    }));
  };

  const cancelDialoghandler = () => {
    setSelectedBranches([]);
    setSelectedSystems([]);
    setSystemRoleSelections({
      FMS: "",
      WMS: "",
      CRM: "",
      TMS: "",
      AMS: "",
      QCMS: "",
      TSMS: "",
      TDMS: "",
    });
    setSelectedAccess("");
    setSelectedTeams([]);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      tenant_id: loggedUser?.tenantId || "",
      phone: "",
      mobile: "",
      fms_user_id: 0,
      fms_branch: [],
      fms_user_role_id: -1,
      wms_user_id: -1,
      wms_user_role_id: -1,
      crm_user_id: -1,
      crm_user_role_id: -1,
      tms_user_id: -1,
      tms_user_role_id: -1,
      ams_user_id: -1,
      ams_user_role_id: "",
      qcms_user_id: -1,
      qcms_user_role_id: "",
      tsms_user_id: -1,
      tsms_user_role_id: "",
      tdms_user_id: -1,
      tdms_user_role_id: "",
      access: "",
      teams: [],
      selected_systems: [],
      systems_with_permission: [],
    });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        style={{
          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#888 transparent", // Firefox
        }}
      >
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="name"
                  value={formData?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="email"
                  type="email"
                  value={formData?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="username"
                  value={formData?.username || ""}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="password"
                  type="password"
                  value={formData?.password || ""}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="confirm-password"
                  type="password"
                  value={formData?.confirmPassword || ""}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <InputWrapper
                  id="phone"
                  value={formData?.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <InputWrapper
                  id="mobile"
                  value={formData?.mobile || ""}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Systems <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-4 pt-2">
                {availableSystems?.map((system: system) => (
                  <div key={system} className="flex items-center space-x-2">
                    <Checkbox
                      id={system.toLowerCase()}
                      checked={selectedSystems.includes(system)}
                      onCheckedChange={() => handleSystemToggle(system)}
                    />
                    <Label
                      htmlFor={system.toLowerCase()}
                      className="font-normal"
                    >
                      {system}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedSystems.length > 0 && (
            <Tabs defaultValue={selectedSystems[0]} className="w-full">
              <TabsList
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${selectedSystems.length}, 1fr)`,
                }}
              >
                {selectedSystems.map((system) => (
                  <TabsTrigger key={system} value={system}>
                    {system}
                  </TabsTrigger>
                ))}
              </TabsList>

              {selectedSystems.map((system) => (
                <TabsContent
                  key={system}
                  value={system}
                  className="border rounded-md p-4 mt-2"
                >
                  <h3 className="text-sm font-medium mb-2">
                    {system} Specific Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${system?.toLowerCase()}-role`}>
                        {system} Role{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={
                          systemRoleSelections[
                            system as keyof typeof systemRoleSelections
                          ]
                        }
                        onValueChange={(value) =>
                          handleRoleChange(system, value)
                        }
                      >
                        <SelectTrigger id={`${system?.toLowerCase()}-role`}>
                          <SelectValue placeholder={`Select ${system} role`} />
                        </SelectTrigger>
                        <SelectContent>
                          {systemRoles[system as keyof typeof systemRoles].map(
                            (role) => (
                              //@ts-ignore
                              <SelectItem
                                key={role.id}
                                value={
                                  // system == "TMS" ? role?.role_type : role?.id
                                  role?.name
                                }
                              >
                                {role.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {system === "FMS" && (
                      <div className="space-y-2">
                        <Label htmlFor="fms-branch">
                          Branch <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            setSelectedBranches((prev) => {
                              if (value === "0") {
                                return ["0"];
                              } else {
                                const filtered = prev.filter((v) => v !== "0");
                                return filtered.includes(value)
                                  ? filtered
                                  : [...filtered, value];
                              }
                            });
                          }}
                          value={
                            formData.fms_branch.at(
                              selectedBranches.length - 1
                            ) || ""
                          }
                        >
                          <SelectTrigger id="fms-branch">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem
                                key={branch.id}
                                value={branch.id.toString()}
                                disabled={
                                  branch.id !== "0" &&
                                  selectedBranches.includes("0")
                                }
                              >
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap items-center space-x-2">
                          {formData.fms_branch
                            .filter((b) => b !== "")
                            .map((branch) => (
                              <div
                                key={branch}
                                className="flex items-center space-x-2"
                              >
                                <p>{getBranchName(branch)}</p>
                                <div
                                  className="w-4 h-4 flex items-center justify-center rounded-full border border-red-500 hover:border-red-800 hover:cursor-pointer"
                                  onClick={() => cancelBranchSelection(branch)}
                                >
                                  <X
                                    size={14}
                                    className="text-destructive hover:text-red-800"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {system === "TMS" && (
                      <div className="space-y-2">
                        <Label htmlFor="tms-branch">
                          All Team Access{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            setSelectedAccess(value);
                          }}
                          value={selectedAccess || ""}
                        >
                          <SelectTrigger id="tms-access">
                            <SelectValue placeholder="Select Access" />
                          </SelectTrigger>
                          <SelectContent>
                            {accesses.map((access) => (
                              <SelectItem
                                key={access.value}
                                value={access.value.toString()}
                              >
                                {access.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedAccess == "0" && (
                          <>
                            <Label htmlFor="tms-branch">
                              Teams <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              onValueChange={(value) => {
                                setSelectedTeams((prev) =>
                                  prev.includes(value) ? prev : [...prev, value]
                                );
                              }}
                              value={
                                formData.teams.at(selectedTeams.length - 1) ||
                                ""
                              }
                            >
                              <SelectTrigger id="tms-team">
                                <SelectValue placeholder="Select Team" />
                              </SelectTrigger>
                              <SelectContent>
                                {teams.map((team) => (
                                  <SelectItem
                                    key={team.teamId}
                                    value={team.teamId.toString()}
                                  >
                                    {team.teamName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap items-center space-x-2">
                              {formData.teams.map(
                                (teamId) =>
                                  teamId !== "" && (
                                    <div
                                      key={teamId}
                                      className="flex items-center space-x-2"
                                    >
                                      <p>{getTeamName(teamId)}</p>
                                      <div
                                        className="w-4 h-4 flex items-center justify-center rounded-full border border-red-500 hover:border-red-800 hover:cursor-pointer"
                                        onClick={() =>
                                          cancelTeamSelection(teamId)
                                        }
                                      >
                                        <X
                                          size={14}
                                          className="text-destructive hover:text-red-800"
                                        />
                                      </div>
                                    </div>
                                  )
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={cancelDialoghandler}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <GroupAddIcon className="h-8 w-8" />

            {isSending ? "Registering..." : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
