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
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { accesses, availableSystems, branches, systemRoles } from "@/lib/ums/data";
import { X } from "lucide-react";
import {
  CRM_API_PATH,
  FMS_API_PATH,
  TMS_API_PATH,
  WMS_API_PATH,
} from "@/app/config/setting";
import { FormUser, system, Team, user } from "@/lib/ums/type";
import { getBranchName, getRoleId, getRoleName } from "@/lib/ums/utils";
import { toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import { set } from "date-fns";
import InputWrapper from "./input-wrapper";
import { useData } from "@/app/contexts/dataContext";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addUpdatedUser: (user: user) => void;
  user: user;
  system: system;
}

export function AddMoreUserDialog({
  open,
  system,
  onOpenChange,
  user,
  addUpdatedUser,
}: AddUserDialogProps) {
  const [formData, setFormData] = useState<FormUser>({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
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
    selected_systems: [],
    systems_with_permission: [],
    access: "",
    teams: [],
  });
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<string | null>();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const [isSending, setIsSending] = useState(false);

  // System-specific role selections
  const [systemRoleSelections, setSystemRoleSelections] = useState<
    Record<string, string>
  >({
    FMS: "",
    WMS: "",
    CRM: "",
    TMS: "",
  });

  const { access_token, updateUserInKeycloak } = useAuth();

  const { teams } = useData();

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
        fms_user_id: user.fms_user_id || -1,
        fms_branch: user.fms_branch || [],
        fms_user_role_id: user.fms_user_role_id || -1,
        wms_user_id: user.wms_user_id || -1,
        wms_user_role_id: user.wms_user_role_id || -1,
        crm_user_id: user.crm_user_id || -1,
        crm_user_role_id: user.crm_user_role_id || -1,
        tms_user_id: user.tms_user_id || -1,
        tms_user_role_id: user.tms_user_role_id || -1,
        selected_systems: user.selected_systems || [],
        systems_with_permission: user.systems_with_permission || [],
        access: user.access || "",
        teams: user.teams || [],
      });
      setSystemRoleSelections({
        FMS: getRoleName("FMS", user.fms_user_role_id) || "",
        WMS: getRoleName("WMS", user.wms_user_role_id) || "",
        CRM: getRoleName("CRM", user.crm_user_role_id) || "",
        TMS: getRoleName("TMS", user.tms_user_role_id) || "",
      });
    }
  }, [user]);

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

  const getTeamName = (teamId: string): string => {
    console.log(teamId);
    const team = teams.find((team: Team) => team.teamId === Number(teamId));
    return team ? team.teamName : "Unknown Team";
  };

  const handleRoleChange = (system: string, roleId: string) => {
    setSystemRoleSelections((prev) => ({
      ...prev,
      [system]: roleId,
    }));
  };

  const cancelBranchSelection = (branch: string) => {
    setSelectedBranches((prev) => prev.filter((b) => b !== branch));
  };

  const cancelTeamSelection = (team: string) => {
    setSelectedTeams((prev) => prev.filter((b) => b !== team));
    setFormData((prev) => ({
      ...prev,
      teams: prev.teams.filter((team) => team !== team),
    }));
  };

  const handleSubmit = async () => {
    if (system == "FMS" && systemRoleSelections.FMS === "") {
      toastify.warn("Please select a role for FMS");
      return;
    }
    if (system == "WMS" && systemRoleSelections.WMS === "") {
      toastify.warn("Please select a role for WMS");
      return;
    }
    if (system == "CRM" && systemRoleSelections.CRM === "") {
      toastify.warn("Please select a role for CRM");
      return;
    }
    if (system == "TMS" && systemRoleSelections.TMS === "") {
      toastify.warn("Please select a role for TMS");
      return;
    }

    if (system == "FMS" && selectedBranches.length === 0) {
      toastify.warn("Please select branch in FMS setting");
      return;
    }

    if (
      system == "TMS" &&
      selectedAccess === "0" &&
      formData.teams.filter((team) => team !== "").length === 0
    ) {
      toastify.warn("Please select teams in TMS setting");
      return;
    }

    let fms_user_id = 0;
    let crm_user_id = 0;
    let wms_user_id = 0;
    let tms_user_id = 0;
    let registered_system: system[] = user.selected_systems;

    const ssoUser = {
      ...formData,
      teams: Array.isArray(formData?.teams)
        ? formData.teams.filter((team) => team !== "")
        : [],
      access: selectedAccess,
    };

    setIsSending(true);
    try {
      const keycloakResponse = await updateUserInKeycloak(
        user.email,
        formData.username,
        formData.password,
        [],
        [system],
      );

      if (!keycloakResponse.error) {
        const response = await fetch(`/api/ums/systems/add/${system}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ssoUser: ssoUser,
            systemRoleSelections: systemRoleSelections,
            accessToken: access_token,
            selectedAccess: selectedAccess,
          }),
        });

        const responseData = await response.json();
        await setIsSending(false);

        if (!response.ok) {
          const error = await response.json();
          console.log(error);
          throw new Error(error.message);
        }

        if (responseData.error) {
          hotToast.error(responseData.message, {
            duration: 5000,
          });
          throw new Error(responseData.message);
        }

        //   const updateUser: system = user;
        let updatedUser: user = user;

        if (system === "FMS") {
          fms_user_id = responseData.data.userid;
          updatedUser = {
            ...user,
            fms_user_id: fms_user_id,
            fms_branch: selectedBranches,
            fms_user_role_id: getRoleId(systemRoleSelections["FMS"], "FMS"),
            systems_with_permission: [...user.systems_with_permission, "FMS"],
          };
        } else if (system === "WMS") {
          wms_user_id = responseData.data.userid;
          updatedUser = {
            ...user,
            wms_user_id: wms_user_id,
            wms_user_role_id: getRoleId(systemRoleSelections["WMS"], "WMS"),
            systems_with_permission: [...user.systems_with_permission, "WMS"],
          };
        } else if (system === "CRM") {
          crm_user_id = responseData.data.userid;
          updatedUser = {
            ...user,
            crm_user_id: crm_user_id,
            crm_user_role_id: getRoleId(systemRoleSelections["CRM"], "CRM"),
            systems_with_permission: [...user.systems_with_permission, "CRM"],
          };
        } else if (system === "TMS") {
          tms_user_id = responseData.data.userid;
          updatedUser = {
            ...user,
            tms_user_id: tms_user_id,
            tms_user_role_id: getRoleId(systemRoleSelections["TMS"], "TMS"),
            systems_with_permission: [...user.systems_with_permission, "TMS"],
            access: selectedAccess || "0",
            teams: formData.teams || [],
          };
        }

        registered_system.push(system);

        fetch(`/api/ums/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            toastify.success("UMS updated!");
            const updatedUserWithId = {
              ...updatedUser,
              id: user.id,
            };
            addUpdatedUser(updatedUserWithId);
            setSelectedBranches([]);
            setSystemRoleSelections({
              FMS: "",
              WMS: "",
              CRM: "",
              TMS: "",
            });
            setSelectedAccess(null);
            onOpenChange(false);
            setIsSending(false);
            toastify.success("Updated new user into UMS!", {
              autoClose: 3000,
            });
          }
        });
      } else {
        throw new Error(keycloakResponse.message);
      }

      setIsSending(false);
    } catch (error) {
      hotToast.error("Error adding user: " + error);
      setIsSending(false);
    }
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
          <DialogTitle>Create User for {system}</DialogTitle>
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
                  value={user?.name || ""}
                  disabled
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
                  value={user?.email || ""}
                  disabled
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <InputWrapper
                  id="username"
                  value={user?.username || ""}
                  disabled
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
                  value={user?.password || ""}
                  disabled
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <InputWrapper id="phone" value={user?.phone || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <InputWrapper id="mobile" value={user?.mobile || ""} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Systems <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="crm"
                    checked={true}
                    // onCheckedChange={() => handleSystemToggle("CRM")}
                  />
                  <Label htmlFor="crm" className="font-normal">
                    {system}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue={system} className="w-full">
            <TabsList
              className="grid"
              style={{
                gridTemplateColumns: `repeat(1, 1fr)`,
              }}
            >
              <TabsTrigger key={system} value={system}>
                {system}
              </TabsTrigger>
            </TabsList>

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
                    {system} Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    // value={systemRoleSelections[system] || ""}
                    value={
                      systemRoleSelections[
                        system as keyof typeof systemRoleSelections
                      ]
                    }
                    onValueChange={(value) => handleRoleChange(system, value)}
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
                        formData.fms_branch.at(selectedBranches.length - 1) ||
                        ""
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
                            formData?.teams.at(selectedTeams.length - 1) || ""
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
                          {Array.isArray(formData?.teams) &&
                            formData.teams
                              .filter((teamId) => teamId !== "")
                              .map((teamId, index) => (
                                <div
                                  key={`${teamId}-${index}`}
                                  className="flex items-center space-x-2"
                                >
                                  <p>{getTeamName(teamId)}</p>
                                  <div
                                    className="w-4 h-4 flex items-center justify-center rounded-full border border-red-500 hover:border-red-800 hover:cursor-pointer"
                                    onClick={() => cancelTeamSelection(teamId)}
                                  >
                                    <X
                                      size={14}
                                      className="text-destructive hover:text-red-800"
                                    />
                                  </div>
                                </div>
                              ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
