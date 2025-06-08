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
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { useUser } from "@/app/contexts/UserContext";
import { useAuth } from "@/app/contexts/authContext";
import {
  FormUser,
  SelectedSystemRoles,
  system,
  Team,
  user,
} from "@/lib/ums/type";
import { addUserToSystemsAndUMS } from "@/lib/ums/systemHandlers/add/addUserToSystemsAndUMS";
import { useData } from "@/app/contexts/dataContext";

interface FormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  mobile: string;
  tenantId: string;
  teams: Team[];
  systems: system[];
}

export default function SystemRegistration() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    mobile: "",
    tenantId: "",
    teams: [],
    systems: [],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { user: loggedUser, loading } = useUser();
  const { access_token, addUserToKeycloak } = useAuth();
  const { teams } = useData();

  const systemOptions = [
    // { value: "FMS" as system, label: "FMS" },
    // { value: "TMS" as system, label: "TMS" },
    // { value: "CRM" as system, label: "CRM" },
    { value: "WMS" as system, label: "WMS" },
  ];

  useEffect(() => {
    setFormData({
      name: loggedUser?.name || "",
      email: loggedUser?.email || "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      mobile: "",
      tenantId: loggedUser?.tenantId || "",
      teams: teams,
      systems: [],
    });
  }, [loggedUser, teams]);

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegistration = async () => {
    const requiredFields: { field: keyof FormData; label: string }[] = [
      { field: "name", label: "Name" },
      { field: "email", label: "Email" },
      { field: "username", label: "Username" },
      { field: "password", label: "Password" },
      { field: "confirmPassword", label: "Confirm Password" },
    ];

    // Check for empty fields
    for (let { field, label } of requiredFields) {
      if (!formData[field]) {
        hotToast.error(`${field} are required`, {
        duration: 3000,
      });
        return;
      }
    }

    // Additional password match validation
    if (formData.password !== formData.confirmPassword) {
      alert(`Password is not matched.`);
      hotToast.error(`Password is not matched.`, {
        duration: 3000,
      });
      return;
    }

    console.log("Form Data => ", formData);

    setIsRegistering(true);

    try {
      const keycloakResponse = await addUserToKeycloak(
        formData.username,
        formData.email,
        formData.password,
        formData.systems
      );

      if (keycloakResponse.error) {
        throw new Error(keycloakResponse.message);
      }

      const systemAdminRoles = {
        CRM: "2",
        WMS: "Admin",
        FMS: "1",
        TMS: "2",
      };

      const tmsAdminAccess = "1";

      const fmsBranches = ["0"];

      const result = await addUserToSystemsAndUMS(
        formData,
        formData.systems,
        systemAdminRoles,
        access_token,
        tmsAdminAccess,
        fmsBranches
      );

      console.log(":: addUserToSystemsAndUMS result from registeration panel :: => ",
        result
      )

      if (result.success) {
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

   const handleSaveUpdates = async () => {
    setIsRegistering(true);
    // try {
    //   // Call your backend to update the registered fields
    //   const result = await updateUserDetailsAPI(formData);
    //   if (result.success) {
    //     hotToast.success("User details updated successfully", { duration: 3000 });
    //     setEditMode(false); // Exit edit mode
    //   } else {
    //     throw new Error(result.error || "Failed to update user details");
    //   }
    // } catch (error: unknown) {
    //   hotToast.error(
    //     error instanceof Error ? error.message : "An unexpected error occurred",
    //     { duration: 5000 }
    //   );
    // } finally {
    //   setIsRegistering(false);
    // }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    // Optionally, reset the form to original data
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 md:p-8">
      {/* Left Panel: Form */}
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
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
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
              formData.systems.includes(option.value)
            )}
            onChange={(selected) =>
              handleChange(
                "systems",
                selected.map((option) => option.value)
              )
            }
            className="basic-multi-select"
            classNamePrefix="select"
            required
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={handleRegistration}>
          {isRegistering ? "Register..." : "Register" }
        </Button>
      </div>

      {/* Right Panel: Registration Status */}
      <Card className="shadow-md">
        <CardContent>
          <Typography variant="h6" component="div">
            Registration Status
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Name" secondary={formData.name || "N/A"} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Email"
                secondary={formData.email || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Username"
                secondary={formData.username || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Phone"
                secondary={formData.phone || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Mobile"
                secondary={formData.mobile || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Selected Systems"
                secondary={
                  formData.systems.length
                    ? formData.systems.join(", ")
                    : "None Selected"
                }
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  );
}
