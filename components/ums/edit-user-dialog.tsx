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

import { accesses, branches, systemRoles } from "@/lib/ums/data";

import { X } from "lucide-react";

import {
  FormUser,
  SelectedSystemRoles,
  system,
  Team,
  user,
} from "@/lib/ums/type";
import { getBranchName, getRoleName } from "@/lib/ums/utils";
import { toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import InputWrapper from "./input-wrapper";
import { useData } from "@/app/contexts/dataContext";
import { updateUserToPortals } from "@/lib/ums/systemHandlers/edit/updateUserToPortals";
import { isPlanExpired } from "@/lib/utils";
import { useUser } from "@/app/contexts/UserContext";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: user;
  addUpdatedUser: (user: user) => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  addUpdatedUser,
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
    tenant_id: "",
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
    ams_user_id: 0,
    ams_user_role_id: "",
    qcms_user_id: 0,
    qcms_user_role_id: "",
    tsms_user_id: 0,
    tsms_user_role_id: "",
    tdms_user_id: 0,
    tdms_user_role_id: "",
    hr_user_id: 0,
    hr_user_role_id: "",
    selected_systems: [],
    systems_with_permission: [],
    access: "",
    teams: [],
  });

  const [selectedAccess, setSelectedAccess] = useState<string>("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // System-specific role selections
  const [systemRoleSelections, setSystemRoleSelections] =
    useState<SelectedSystemRoles>({
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
        user.tms_user_role_id === -1
          ? ""
          : getRoleName("TMS", user.tms_user_role_id) || "",
      AMS:
        user.ams_user_role_id === -1
          ? ""
          : getRoleName("AMS", user.ams_user_role_id) || "",
      QCMS:
        user.qcms_user_role_id === -1
          ? ""
          : getRoleName("QCMS", user.qcms_user_role_id) || "",
      TSMS:
        user.tsms_user_role_id === -1
          ? ""
          : getRoleName("TSMS", user.tsms_user_role_id) || "",
      TDMS:
        user.tdms_user_role_id === -1
          ? ""
          : getRoleName("TDMS", user.tdms_user_role_id) || "",
      HR:
        user.hr_user_role_id === -1
          ? ""
          : getRoleName("HR", user.hr_user_role_id) || "",
      CHATESS:
        user.chatess_user_id === -1
          ? ""
          : getRoleName("CHATESS", user.chatess_user_role_id) || "",
    });

  const { access_token, updateUserInKeycloak } = useAuth();
  const { teams } = useData();
  const { user:loggedUser } = useUser();

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        password: user.password || "",
        confirmPassword: "",
        tenant_id: "",
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
        ams_user_id: user.ams_user_id || 0,
        ams_user_role_id: user.ams_user_role_id || -1,
        qcms_user_id: user.qcms_user_id || 0,
        qcms_user_role_id: user.qcms_user_role_id || -1,
        tsms_user_id: user.tsms_user_id || 0,
        tsms_user_role_id: user.tsms_user_role_id || -1,
        tdms_user_id: user.tdms_user_id || 0,
        tdms_user_role_id: user.tdms_user_role_id || -1,
        hr_user_id: user.tdms_user_id || 0,
        hr_user_role_id: user.tdms_user_role_id || -1,
        chatess_user_id: user.chatess_user_id || 0,
        chatess_user_role_id: user.chatess_user_role_id || -1,
        chatess_workspace: user.chatess_workspace || "",
        selected_systems: user.selected_systems || [],
        systems_with_permission: user.systems_with_permission || [],
        access: user.access || "",
        teams: user.teams || [],
      });

      setSelectedAccess(user.access || "");

      setSelectedBranches(user.fms_branch || []);

      setSelectedSystems(user.systems_with_permission || []);

      setSystemRoleSelections({
        FMS: getRoleName("FMS", user.fms_user_role_id) || "",
        WMS: getRoleName("WMS", user.wms_user_role_id) || "",
        CRM: getRoleName("CRM", user.crm_user_role_id) || "",
        TMS: getRoleName("TMS", user.tms_user_role_id) || "",
        AMS: getRoleName("AMS", user.ams_user_role_id) || "",
        QCMS: getRoleName("QCMS", user.qcms_user_role_id) || "",
        TSMS: getRoleName("TSMS", user.tdms_user_role_id) || "",
        TDMS: getRoleName("TDMS", user.tsms_user_role_id) || "",
        HR: getRoleName("HR", user.hr_user_role_id) || "",
        CHATESS: getRoleName("CHATESS", user.chatess_user_role_id) || "",
      });
    }
  }, [user]);

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

  useEffect(() => {
      setIsExpired(isPlanExpired(loggedUser?.planExpiresAt));
    }, [loggedUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (system: string, roleId: string) => {
    setSystemRoleSelections((prev) => ({
      ...prev,
      [system]: roleId,
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

    const systemRolesRequired: system[] = [
      "FMS",
      "WMS",
      "CRM",
      "TMS",
      "AMS",
      "QCMS",
      "TSMS",
      "TDMS",
      "HR",
      "CHATESS"
    ];

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
    if (!validateForm()) {
      return;
    }

    if(isExpired) {
      toastify.warn("Sorry, your plan was expired", {autoClose: 3000});
      return;
    }

    setIsUpdating(true);

    try {
      const keycloakUpdateResponse = await updateUserInKeycloak(
        user.email,
        formData.username,
        formData.password
      );

      if (keycloakUpdateResponse.error) {
        throw new Error(`Keycloak Error: ${keycloakUpdateResponse.message}`);
      }

      const portalUpdateResponse = await updateUserToPortals(
        formData,
        selectedSystems,
        systemRoleSelections,
        access_token,
        selectedAccess,
        user
      );

      if (portalUpdateResponse.success) {
        addUpdatedUser(portalUpdateResponse.data as user);
        toastify.success("Successfully updated!");
        onOpenChange(false);
      } else {
        throw new Error(
          portalUpdateResponse.error || "Failed to update user in portals"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during update";
      hotToast.error(errorMessage);
    } finally {
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
                    className="h-auto p-0 text-xs text-[#1bb6f9]"
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

            {/* <div className="space-y-2">
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
            </div> */}
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
                        <SelectTrigger
                          id={`edit-${system?.toLowerCase()}-role`}
                        >
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
          <Button className="bg-[#1bb6f9]" onClick={handleSubmit}>
            {isUpdating ? "Saving changes..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
