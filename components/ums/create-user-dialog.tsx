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
// import { addUserToSystemsAndUMS } from "@/lib/ums/systemHandlers/add/addUserToKeycloak";

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
    access: "",
    teams: [""],
    systems_with_permission: [],
  });

  const { access_token, addUserToKeycloak } = useAuth();

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
    });

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

    if (formData.password !== formData.confirmPassword) {
      toastify.warn("Passwords do not match");
      return;
    }

    if (selectedSystems.length === 0) {
      toastify.warn("Please select a system");
      return;
    }

    if (selectedSystems.includes("FMS") && systemRoleSelections.FMS === "") {
      toastify.warn("Please select a role for FMS");
      return;
    }
    if (selectedSystems.includes("WMS") && systemRoleSelections.WMS === "") {
      toastify.warn("Please select a role for WMS");
      return;
    }
    if (selectedSystems.includes("CRM") && systemRoleSelections.CRM === "") {
      toastify.warn("Please select a role for CRM");
      return;
    }
    if (selectedSystems.includes("TMS") && systemRoleSelections.TMS === "") {
      toastify.warn("Please select a role for TMS");
      return;
    }

    if (selectedSystems.includes("FMS") && selectedBranches.length === 0) {
      toastify.warn("Please select at least one branch");
      return;
    }

    if (
      selectedSystems.includes("TMS") &&
      selectedAccess === "0" &&
      formData.teams.filter((team) => team !== "").length === 0
    ) {
      toastify.warn("Please select teams in TMS setting");
      return;
    }

    if (selectedSystems.includes("TMS") && selectedAccess == "") {
      toastify.warn("Please select access");
      return;
    }

    if (
      selectedSystems.includes("TMS") &&
      selectedAccess === "0" &&
      formData.teams.filter((team) => team !== "").length === 0
    ) {
      toastify.warn("Please select teams in TMS setting");
      return;
    }
    console.log("selectedSystems before saving into system ", selectedSystems);

    const keycloakResponse = await addUserToKeycloak(
      formData.username,
      formData.email,
      formData.password,
      selectedSystems
    );

    // Create a user in the central SSO system

    setIsSending(true);

    const ssoUser = {
      ...formData,
      systems: selectedSystems.map((system) => ({
        name: system,
        roleId: getRoleId(
          systemRoleSelections[system as keyof typeof systemRoleSelections],
          system
        ),
      })),
      teams: formData.teams.filter((team) => team !== ""),
    };

    if (!keycloakResponse.error) {

      // await addUserToSystemsAndUMS(
      //   formData,
      //   selectedSystems,
      //   systemRoleSelections,
      //   access_token,
      //   selectedAccess,
      //   selectedBranches
      // ).then((res) => {

      // }).catch((error) => {
        
      // });

      let fms_user_id = -1;
      let crm_user_id = -1;
      let wms_user_id = -1;
      let tms_user_id = -1;
      let registered_system: any[] = [];
      let countsOfRegisteredSystem = 0;

      try {
        const results = await Promise.allSettled(
          selectedSystems.map(async (system) => {
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
            
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message);
            }

            if (responseData.error) {
              hotToast.error(responseData.message, { duration: 5000 });
              throw new Error(responseData.message);
            }

            return responseData.data;
          })
        );

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            if (result.value.system === "FMS") {
              fms_user_id = result.value.userid;
            } else if (result.value.system === "WMS") {
              wms_user_id = result.value.userid;
            } else if (result.value.system === "CRM") {
              crm_user_id = result.value.userid;
            } else if (result.value.system === "TMS") {
              tms_user_id = result.value.userid;
            }
            registered_system.push(result.value.system);
            countsOfRegisteredSystem++;
          }
        });
      } catch (error) {
        // console.error("Error fetching user data:", error);
        hotToast.error("Failed to register user for all systems.", {
          duration: 5000,
        });
      }

      if (countsOfRegisteredSystem < selectedSystems.length) {
        toastify.warn("Failed to register user for all systems.", {
          autoClose: 3000,
        });
      }

      if (registered_system.length > 0) {
        const newUser = {
          name: ssoUser.name,
          email: ssoUser.email,
          username: ssoUser.username,
          password: ssoUser.password,
          phone: ssoUser.phone,
          mobile: ssoUser.mobile,
          fms_user_id: registered_system.includes("FMS") ? fms_user_id : -1,
          fms_branch: registered_system.includes("FMS") ? selectedBranches : [],
          fms_user_role_id: registered_system.includes("FMS")
            ? getRoleId(systemRoleSelections["FMS"], "FMS")
            : -1,
          wms_user_id: registered_system.includes("WMS") ? wms_user_id : -1,
          wms_user_role_id: registered_system.includes("WMS")
            ? getRoleId(systemRoleSelections["WMS"], "WMS")
            : -1,
          crm_user_id: registered_system.includes("CRM") ? crm_user_id : -1,
          crm_user_role_id: registered_system.includes("CRM")
            ? getRoleId(systemRoleSelections["CRM"], "CRM")
            : -1,
          tms_user_id: registered_system.includes("TMS") ? tms_user_id : -1,
          tms_user_role_id: registered_system.includes("TMS")
            ? getRoleId(systemRoleSelections["TMS"], "TMS")
            : -1,
          selected_systems: registered_system,
          systems_with_permission: registered_system,
          access: registered_system.includes("TMS") ? selectedAccess : "0",
          teams: registered_system.includes("TMS")
            ? ssoUser.teams.filter((team) => team !== "")
            : [""],
        };

        fetch(`/api/ums/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        })
          .then(async (response) => {
            if (response.ok) {
              const data = await response.json();
              addNewUser(data);

              toastify.success("Regiserted new user into UMS!", {
                autoClose: 3000,
              });
            }
          })
          .catch((error) => {
            console.error("Error creating user:", error);
            hotToast.error("Error creating users", {
              duration: 3000,
            });
            setIsSending(false);
          });
      } else {
        hotToast.error("User was not registered at any system.", {
          duration: 5000,
        });
      }

      // onOpenChange(false);
      setIsSending(false);
      setIsSending(false);

      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
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
      });
      setSelectedAccess("");
    } else {
      hotToast.error(keycloakResponse.message, {
        duration: 3000,
      });
      setIsSending(false);
    }
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
    });
    setSelectedAccess("");
    setSelectedTeams([]);
    setFormData({
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
      wms_user_id: -1,
      wms_user_role_id: -1,
      crm_user_id: -1,
      crm_user_role_id: -1,
      tms_user_id: -1,
      tms_user_role_id: -1,
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
