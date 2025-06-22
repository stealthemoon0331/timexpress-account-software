"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";

import Select from "react-select";
import {
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { useUser } from "@/app/contexts/UserContext";
import { useAuth } from "@/app/contexts/authContext";
import {
  FormUser,
  SelectedSystemRoles,
  system,
  Team,
  user,
} from "@/lib/ums/type";
import { addUserToPortals } from "@/lib/ums/systemHandlers/add/addUserToPortals";
import { useData } from "@/app/contexts/dataContext";
import { checkIfHasTenant, registerTenantId } from "@/lib/tenant";
import { updateUserToPortals } from "@/lib/ums/systemHandlers/edit/updateUserToPortals";
import { getRoleName } from "@/lib/ums/utils";
import { useFormStore } from "@/lib/store/user-form";

interface FormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  mobile: string;
  fms_branch: string[];
  tenantId: string;
  teams: string[];
  selected_systems: system[];
}

export default function SystemRegistration() {
  const [registeredUser, setRegisteredUser] = useState<FormUser | null>(null);
  const [hasTenant, setHasTenant] = useState<boolean>(false);
  // const [formData, setFormData] = useState<FormData>({
  //   name: "",
  //   email: "",
  //   username: "",
  //   password: "",
  //   confirmPassword: "",
  //   phone: "",
  //   mobile: "",
  //   fms_branch: [],
  //   tenantId: "",
  //   teams: [],
  //   selected_systems: [],
  // });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { user: loggedUser, loading } = useUser();

  const { access_token, addUserToKeycloak, updateUserInKeycloak } = useAuth();

  const { teams } = useData();

  const { formData, setFormData } = useFormStore();

  const requiredFields: { field: keyof FormData; label: string }[] = [
    { field: "name", label: "Name" },
    { field: "email", label: "Email" },
    { field: "username", label: "Username" },
    { field: "password", label: "Password" },
    { field: "confirmPassword", label: "Confirm Password" },
    { field: "selected_systems", label: "Selected Systems" },
  ];

  const systemOptions = [
    { value: "FMS" as system, label: "FMS" },
    // { value: "TMS" as system, label: "TMS" },
    { value: "CRM" as system, label: "CRM" },
    { value: "WMS" as system, label: "WMS" },
    { value: "AMS" as system, label: "AMS" },
  ];

  const systemAdminRoles = {
    CRM: "Admin",
    WMS: "Admin",
    FMS: "Admin",
    TMS: "2",
    AMS: "Admin",
  };

  const tmsAdminAccess = "1";

  const fmsBranches = ["0"];

  useEffect(() => {
    checkTenant();
    fetchUsers();
  }, []);

  useEffect(() => {
    //Get registered data

    console.log("teams => ", teams);

    if (!formData.username && !formData.phone && !formData.mobile && !formData.selected_systems) {
      setFormData({
        name: loggedUser?.name || "",
        email: loggedUser?.email || "",
        username: "",
        password: "",
        confirmPassword: "",
        phone: "",
        mobile: "",
        tenantId: "",
        fms_branch: fmsBranches,
        teams: teams?.map((team) => team.teamId.toString()),
        selected_systems: [],
      });
    }
  }, [loggedUser, teams]);

  const checkTenant = async () => {
    if (loggedUser?.email) {
      const checkingResponse = await checkIfHasTenant(loggedUser.email);
      if (!checkingResponse.error) {
        const tenantId = checkingResponse.data;
        console.log("*** tenantId *** ", tenantId);
        if (tenantId) {
          setHasTenant(true);
        } else {
          setHasTenant(false);
        }
      } else {
        console.error(checkingResponse.errorMessage);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/ums/customers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const fetchData = await response.json();

      console.log("fetchData from ums/customers => ", fetchData);

      // Check if fetchData is an array
      if (Array.isArray(fetchData)) {
        if (fetchData.length > 0) {
          fetchData.map((data: any) => {
            if (data.fms_branch) {
              try {
                data.fms_branch = JSON.parse(data.fms_branch);
              } catch (error) {
                console.error("Error parsing fms_branch:", error);
                data.fms_branch = [];
              }
            }

            if (data.selected_systems) {
              const selected_systems: string[] = [];
              JSON.parse(data.selected_systems).map((system: system) => {
                selected_systems.push(system);
              });
              data.selected_systems = selected_systems;
            }

            if (data.teams) {
              if (typeof data.teams === "string") {
                try {
                  const parsed = JSON.parse(data.teams.replace(/'/g, '"'));
                  data.teams = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  console.error("Error parsing teams:", e);
                  data.teams = [];
                }
              } else if (!Array.isArray(data.teams)) {
                data.teams = [];
              }
            }

            if (data.systems_with_permission) {
              const systems_with_permission: string[] = [];
              JSON.parse(data.systems_with_permission).map((system: system) => {
                systems_with_permission.push(system);
              });
              data.systems_with_permission = systems_with_permission;
            }
          });

          if (fetchData.find((data) => data.email === loggedUser?.email)) {
            console.log("fetchdata for checking registeration", fetchData);

            setRegisteredUser(
              fetchData.find((data) => data.email === loggedUser?.email)
            );
          }
          return true;
        }
      } else {
        // setIsLoading(false);
        toastify.error("Server Error: can not load data!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return false;
      }
    } catch (error) {
      // setIsLoading(false);
      toastify.error("Server Error: can not load data!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return false;
    }
  };

  const handleChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData({ [field]: value });
  };

  const handleRegistration = async () => {
    // Check for empty fields
    for (let { field, label } of requiredFields) {
      if (!formData[field]) {
        hotToast.error(`${field} are required`, {
          duration: 3000,
        });
        return;
      }
    }

    if (formData.selected_systems.length === 0) {
      hotToast.error(`Please select any system.`, {
        duration: 3000,
      });
      return;
    }

    // Additional password match validation
    if (formData.password !== formData.confirmPassword) {
      hotToast.error(`Password is not matched.`, {
        duration: 3000,
      });
      return;
    }

    console.log("Form Data => ", formData);

    //Generating the talentId and then register into table
    let tenantId = "";

    if (loggedUser?.email) {
      const tenantRegResponse = await registerTenantId(loggedUser.email);

      if (!tenantRegResponse.error) {
        tenantId = tenantRegResponse.tenantId;
      } else {
        hotToast.error(tenantRegResponse?.errorMessage || "Error", {
          duration: 3000,
        });

        return;
      }
    }

    setIsRegistering(true);

    const formDataWithTenantId = { ...formData, tenantId };

    try {
      const keycloakResponse = await addUserToKeycloak(
        formDataWithTenantId.username,
        formDataWithTenantId.email,
        formDataWithTenantId.password,
        formDataWithTenantId.selected_systems
      );

      if (keycloakResponse.error) {
        throw new Error(keycloakResponse.message);
      }

      const result = await addUserToPortals(
        formDataWithTenantId,
        formDataWithTenantId.selected_systems,
        systemAdminRoles,
        access_token,
        tmsAdminAccess,
        fmsBranches
      );

      console.log(
        ":: addUserToSystemsAndUMS result from registeration panel :: => ",
        result
      );

      if (result.success) {
        setRegisteredUser(result.data);

        setHasTenant(true);

        toastify.success("Registered new user into UMS!", { autoClose: 3000 });

        if (result.warning) {
          toastify.warn(result.warning, { autoClose: 3000 });
        }

        // Reset form states
      } else {
        throw new Error(result.error || "Failed to register user");
      }
    } catch (error: unknown) {
      console.log("error => ", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      hotToast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsRegistering(false);
    }

    // If all validations pass
    console.log("Registration Successful", formData);
    // Add backend integration logic here
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const handleSaveUpdates = async () => {
    console.log("formData to be updated : ", formData);

    if (!registeredUser) return;

    for (let { field, label } of requiredFields) {
      if (!formData[field]) {
        hotToast.error(`${field} are required`, {
          duration: 3000,
        });
        return;
      }
    }

    // if (formData.selected_systems.length === 0) {
    //   hotToast.error(`Please select any system.`, {
    //     duration: 3000,
    //   });
    //   return;
    // }

    // Additional password match validation
    if (formData.password !== formData.confirmPassword) {
      hotToast.error(`Password is not matched.`, {
        duration: 3000,
      });
      return;
    }

    console.log("handleSaveUpdates() is called");
    console.log("formData is ", formData);

    try {
      setIsUpdating(true);

      const keycloakUpdateResponse = await updateUserInKeycloak(
        registeredUser.email,
        // formData.email,
        formData.username,
        formData.password,
        [],
        registeredUser.selected_systems
      );

      if (!keycloakUpdateResponse.error) {
        console.log("updateUserToPortal calling");

        const portalUpdateResponse: any = await updateUserToPortals(
          formData,
          registeredUser.selected_systems,
          systemAdminRoles,
          access_token,
          tmsAdminAccess,
          registeredUser
        );

        if (portalUpdateResponse.success) {
          // addUpdatedUser(portalUpdateResponse.data);
          toastify.success("Successfully updated!");

          handleCancelEdit();

          setRegisteredUser(portalUpdateResponse.data);
        } else {
          throw new Error(portalUpdateResponse.error);
        }
      } else {
        hotToast.error(`Keycloak Error : ${keycloakUpdateResponse.message}`);
      }
    } catch (error: any) {
      hotToast.error(
        `Failed update error ${error.message ? ": " + error.message : ""}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    // Optionally, reset the form to original data
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 md:p-8">
      {/* Left Panel: Form */}
      {!hasTenant ? (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">System Account</h2>
          <div className="space-y-3">
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              disabled
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              disabled
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
            />
            <div className="relative">
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <div
                        className="cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </div>
                    </InputAdornment>
                  ),
                }}
                required
              />
            </div>
            <div className="relative">
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </div>
                    </InputAdornment>
                  ),
                }}
                required
              />
            </div>
            <TextField
              fullWidth
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              required
            />
            <TextField
              fullWidth
              label="Mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SmartphoneIcon />
                  </InputAdornment>
                ),
              }}
              required
            />
            <Select
              isMulti
              options={systemOptions}
              value={systemOptions.filter((option) =>
                formData.selected_systems.includes(option.value)
              )}
              onChange={(selected) =>
                handleChange(
                  "selected_systems",
                  selected.map((option) => option.value)
                )
              }
              className="basic-multi-select"
              classNamePrefix="select"
              required
            />
          </div>
          <Button className="w-full sm:w-auto" onClick={handleRegistration}>
            {isRegistering ? "Register..." : "Register"}
          </Button>
        </div>
      ) : (
        <Card className="shadow-md">
          <CardContent>
            <Typography variant="h6" component="div">
              Registration Status
              <IconButton onClick={toggleEditMode}>
                {editMode ? <CloseIcon /> : <EditIcon />}
              </IconButton>
            </Typography>
            {editMode ? (
              <List>
                <ListItem>
                  <TextField
                    fullWidth
                    label="name"
                    variant="outlined"
                    value={formData?.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={formData?.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <div
                            className="cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </div>
                        </InputAdornment>
                      ),
                    }}
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    variant="outlined"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                          </div>
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    fullWidth
                    label="Phone"
                    variant="outlined"
                    value={formData?.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    fullWidth
                    label="Mobile"
                    variant="outlined"
                    value={formData?.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SmartphoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </ListItem>

                <ListItem>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveUpdates}
                      startIcon={<SaveIcon />}
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                </ListItem>
              </List>
            ) : (
              <></>
            )}
            <List>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={registeredUser?.name || "N/A"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={registeredUser?.email || "N/A"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Username"
                  secondary={registeredUser?.username || "N/A"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={registeredUser?.phone || "N/A"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Mobile"
                  secondary={registeredUser?.mobile || "N/A"}
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Selected Systems"
                  secondary={
                    registeredUser?.selected_systems.length
                      ? registeredUser.selected_systems.join(", ")
                      : "None Selected"
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}

      {/* Right Panel: Registration Status */}
    </div>
  );
}
