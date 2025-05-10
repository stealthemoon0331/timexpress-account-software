"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { accesses, branches, systemRoles } from "@/lib/ums/data";

import { X } from "lucide-react";

import { FormUser, system, Team, user } from "@/lib/ums/type";
import {
  getBranchName,
  getIdByRoleType,
  getRoleName,
} from "@/lib/ums/utils";
import { toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import InputWrapper from "./input-wrapper";
import { useData } from "@/app/contexts/dataContext";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: user;
  addUpdatedUser: (user: user) => void;
  getUpdateFailedSystems: (userId: number, systems: system[]) => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  addUpdatedUser,
  getUpdateFailedSystems,
}: EditUserDialogProps) {
  const [selectedSystems, setSelectedSystems] = useState<system[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState<FormUser>({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    mobile: "",
    fms_user_id: 0,
    fms_branch: [],
    fms_user_role_id: -1,
    wms_user_id: 0,
    wms_user_role_id: -1,
    crm_user_id: 0,
    crm_user_role_id: -1,
    tms_user_id: 0,
    tms_user_role_id: -1,
    selected_systems: [],
    systems_with_permission: [],
    access: "",
    teams: [],
  });

  const [selectedAccess, setSelectedAccess] = useState<string>("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // System-specific role selections
  const [systemRoleSelections, setSystemRoleSelections] = useState<
    Record<string, string>
  >({
    FMS:
      user.fms_user_role_id === -1
        ? ""
        : getRoleName("FMS", user.fms_user_role_id) || "",
    WMS:
      user.wms_user_role_id === -1
        ? ""
        : getRoleName("WMS", user.wms_user_role_id) || "",
    CRM:
      user.crm_user_role_id === -1
        ? ""
        : getRoleName("CRM", user.crm_user_role_id) || "",
    TMS:
      user.tms_user_id === -1
        ? ""
        : getRoleName("TMS", user.tms_user_role_id) || "",
  });

  const { access_token, updateUserInKeycloak } = useAuth();

  const { teams } = useData();

  const [isUpdating, setIsUpdating] = useState(false);
  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        password: user.password || "",
        confirmPassword: "",
        phone: user.phone || "",
        mobile: user.mobile || "",
        fms_user_id: user.fms_user_id || 0,
        fms_branch: user.fms_branch || [],
        fms_user_role_id: user.fms_user_role_id || -1,
        wms_user_id: user.wms_user_id || 0,
        wms_user_role_id: user.wms_user_role_id || -1,
        crm_user_id: user.crm_user_id || 0,
        crm_user_role_id: user.crm_user_role_id || -1,
        tms_user_id: user.tms_user_id || 0,
        tms_user_role_id: user.tms_user_role_id || -1,
        selected_systems: user.selected_systems || [],
        systems_with_permission: user.systems_with_permission || [],
        access: user.access || "",
        teams: user.teams || [],
      });

      setSelectedAccess(user.access || "");

      setSelectedSystems(user.systems_with_permission || []);

      setSystemRoleSelections({
        FMS: getRoleName("FMS", user.fms_user_role_id) || "",
        WMS: getRoleName("WMS", user.wms_user_role_id) || "",
        CRM: getRoleName("CRM", user.crm_user_role_id) || "",
        TMS: getRoleName("TMS", user.tms_user_role_id) || "",
      });
    }
  }, [user]);

  const getTeamName = (teamId: string): string => {
    console.log(teamId);
    const team = teams.find((team: Team) => team.teamId === Number(teamId));
    return team ? team.teamName : "Unknown Team";
  };

  const handleSystemToggle = (system: system) => {
    setSelectedSystems((prev) =>
      prev.includes(system)
        ? prev.filter((s) => s !== system)
        : [...prev, system]
    );
    setFormData((prev) => ({
      ...prev,
      selected_systems: selectedSystems,
    }));
    setSystemRoleSelections((prev) => ({
      ...prev,
      [system]: prev[system] || "",
    }));
  };

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (system: string, roleId: string) => {
    setSystemRoleSelections((prev) => ({
      ...prev,
      [system]: roleId,
    }));
  };

  const handleSubmit = async () => {
    if (formData.username == "") {
      toastify.warn("Please input username");
      return;
    }

    if (formData.email == "") {
      toastify.warn("Please input email");
      return;
    }

    if (formData.password == "") {
      toastify.warn("Please input password");
      return;
    }

    if (formData.mobile == "") {
      toastify.warn("Please input mobile number");
      return;
    }

    if (formData.phone == "") {
      toastify.warn("Please input phone number");
      return;
    }

    if (showPasswordFields) {
      if (!formData.password) {
        toastify.warn("Please enter a new password");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toastify.warn("Please confirm new password");
        return;
      }
    }

    if (selectedSystems.includes("FMS") && formData.fms_branch.length === 0) {
      toastify.warn("Please select at least one branch");
      return;
    }

    const teams = Array.isArray(formData.teams) ? formData.teams : [];

    if (
      selectedSystems.includes("TMS") &&
      selectedAccess === "0" &&
      teams.filter((team) => team !== "").length === 0
    ) {
      toastify.warn("Please select teams in TMS setting");
      return;
    }

    const hasEmptyRole = Object.entries(systemRoleSelections).some(
      ([system, roleName]) => {
        if (roleName == null) {
          toastify.warn(`Please select a role for ${system}`);
          return true; // stops at the first invalid role
        }
        return false;
      }
    );

    if (hasEmptyRole) {
      return;
    }

    setIsUpdating(true);
    console.log("formData selected systems", formData.selected_systems);
    const deselectedSystemsToUpdateRole = user.selected_systems.filter(
      (system) => !selectedSystems.includes(system)
    );
    const selectedSystemsToUpdateRole = user.selected_systems.filter(
      (system) => selectedSystems.includes(system)
    );
    
    const updateResponse = await updateUserInKeycloak(
      user.email,
      // formData.email,
      formData.username,
      formData.password,
      deselectedSystemsToUpdateRole,
      selectedSystems,
    );

    if (selectedSystems.length === 0) {
      toastify.info("You just updated the permission of users in keycloak", {
        autoClose: 4000
      });
      
      setIsUpdating(false);
      return;
    }

    if (!updateResponse.error) {
      let countsOfUpdatedSystem = 0;
      let fms_user_role_id = -1;
      let crm_user_role_id = -1;
      let wms_user_role_id = -1;
      let tms_user_role_id = -1;
      let updated_systems: system[] = [];
      try {
        setIsUpdating(false);
        const results = await Promise.allSettled(
          selectedSystems.map(async (system) => {
            const response = await fetch(`/api/ums/systems/edit/${system}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                formData,
                systemRoleSelections,
                accessToken: access_token,
                selectedAccess,
                user,
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
              tms_user_role_id = getIdByRoleType(role, "TMS");
            }

            countsOfUpdatedSystem++;
            toastify.success(`${result.value.system} user updated`, {
              autoClose: 3000,
            });
          } else {
            hotToast.error(result.reason.message);
          }
        });
      } catch (error) {
        console.error("Update error:", error);
        hotToast.error("An error occurred during updates");
      }

      if (countsOfUpdatedSystem !== selectedSystems.length) {
        const failedSystems: system[] = selectedSystems.filter(
          (system) => !updated_systems.includes(system)
        );
        getUpdateFailedSystems(user.id, failedSystems);
        // Handle the case where not all systems were updated successfully with toast
        hotToast.error(`Failed to update ${failedSystems.join(", ")} user`);
      }

      // Update user in the central SSO system
      const updateduser = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password ? formData.password : user.password,
        phone: formData.phone,
        mobile: formData.mobile,
        fms_user_id: user.fms_user_id,
        fms_branch: formData.fms_branch, //
        fms_user_role_id: updated_systems.includes("FMS")
          ? fms_user_role_id
          : user.fms_user_role_id, //
        wms_user_id: user.wms_user_id,
        wms_user_role_id: updated_systems.includes("WMS")
          ? wms_user_role_id
          : user.wms_user_role_id, //
        crm_user_id: user.crm_user_id,
        crm_user_role_id: updated_systems.includes("CRM")
          ? crm_user_role_id
          : user.crm_user_role_id, //
        tms_user_id: user.tms_user_id,
        tms_user_role_id: updated_systems.includes("TMS")
          ? tms_user_role_id
          : user.tms_user_role_id, //
        selected_systems: user.selected_systems, //
        systems_with_permission: updated_systems, //
        access: selectedAccess, //
        teams: formData.teams, //
      };
      await fetch(`/api/ums/customers/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateduser),
      })
        .then((response) => {
          if (response.ok) {
            toastify.success("UMS updated!");
            const updatedUserWithId = {
              ...updateduser,
              id: user.id,
            };
            addUpdatedUser(updatedUserWithId);
            onOpenChange(false);
          } else {
            hotToast.error("Failed to update user");
          }
          setIsUpdating(false);
        })
        .catch((error) => {
          setIsUpdating(false);
          hotToast.error("Error updating user:", {
            duration: 5000,
          });
        });
    } else {
      hotToast.error(`Keycloak Error : ${updateResponse.message}`);
      setIsUpdating(false);
    }
  };

  const cancelBranchSelection = (branch: string) => {
    setSelectedBranches((prev) => prev.filter((b) => b !== branch));
  };

  const cancelTeamSelection = (team: string) => {
    setSelectedTeams((prev) => prev.filter((b) => b !== team));
    setFormData((prev) => ({
      ...prev,
      teams: prev.teams.filter((b) => b !== team),
    }));
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
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="edit-name"
                  value={formData?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="edit-email"
                  type="email"
                  value={formData?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="edit-username"
                  value={formData?.username || ""}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-password">Password</Label>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs"
                    type="button"
                    onClick={() => {
                      // Toggle password reset fields visibility
                      setShowPasswordFields(!showPasswordFields);
                      if (!showPasswordFields) {
                        // Reset password fields when showing them
                        setFormData({
                          ...formData,
                          password: "",
                          confirmPassword: "",
                        });
                      }
                    }}
                  >
                    {showPasswordFields ? "Cancel" : "Reset Password"}
                  </Button>
                </div>
                {showPasswordFields && (
                  <InputWrapper
                    id="edit-password"
                    type="password"
                    value={formData?.password || ""}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="New password"
                  />
                )}
              </div>

              {showPasswordFields && (
                <div className="space-y-2">
                  <Label htmlFor="edit-confirm-password">
                    Confirm Password
                  </Label>
                  <InputWrapper
                    id="edit-confirm-password"
                    type="password"
                    value={formData?.confirmPassword || ""}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <InputWrapper
                  id="edit-phone"
                  value={formData?.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-mobile">Mobile</Label>
                <InputWrapper
                  id="edit-mobile"
                  value={formData?.mobile || ""}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="edit-status"
                    checked={true}
                    disabled
                  />
                  <Label htmlFor="edit-status" className="font-normal">
                    {true ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div> */}
            </div>

            <div className="space-y-2">
              <Label>
                Systems <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-4 pt-2">
                {user.selected_systems.map((system) => (
                  <div key={system} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${system?.toLowerCase()}`}
                      checked={selectedSystems.includes(system)}
                      onCheckedChange={() => handleSystemToggle(system)}
                    />
                    <Label
                      htmlFor={`edit-${system?.toLowerCase()}`}
                      className="font-normal"
                    >
                      {system}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {user.selected_systems.length > 0 && (
            <Tabs defaultValue={user.selected_systems[0]} className="w-full">
              <TabsList
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${user.selected_systems.length}, 1fr)`,
                }}
              >
                {user.selected_systems.map((system) => (
                  <TabsTrigger key={system} value={system}>
                    {system}
                  </TabsTrigger>
                ))}
              </TabsList>

              {user.selected_systems.map((system) => (
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
                      <Label htmlFor={`edit-${system?.toLowerCase()}-role`}>
                        {system} Role{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        // value={systemRoleSelections[system] || ""}
                        value={
                          systemRoleSelections[
                            system as keyof typeof systemRoleSelections
                          ]
                        }
                        onValueChange={(value) =>
                          handleRoleChange(system, value)
                        }
                      >
                        <SelectTrigger id={`edit-${system?.toLowerCase()}-role`}>
                          <SelectValue placeholder={`Select ${system} role`} />
                        </SelectTrigger>
                        <SelectContent>
                          {systemRoles[system as keyof typeof systemRoles].map(
                            (role) => (
                              <SelectItem
                                key={role.id}
                                value={
                                  // system == "TMS" ? role.role_type : role.id
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
                                formData?.teams.at(selectedTeams.length - 1) ||
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
                              {Array.isArray(formData.teams) &&
                                formData.teams.map(
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
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isUpdating ? "Saving changes..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
