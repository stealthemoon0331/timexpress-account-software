"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Pagination from "@mui/material/Pagination";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { CreateUserDialog } from "@/components/ums/create-user-dialog";
import { EditUserDialog } from "@/components/ums/edit-user-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PasswordResetDialog } from "@/components/ums/password-reset-dialog";

import { getBranchName, getRoleName } from "@/lib/ums/utils";
import {
  PermissionedSystem,
  system,
  Team,
  user,
} from "@/lib/ums/type";
import { ToastContainer, toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import "@/lib/ums/css/loading.css";
import {
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { AddMoreUserDialog } from "./add-more-user-dialog";
import InputWrapper from "./input-wrapper";
import { useData } from "@/app/contexts/dataContext";
import { Checkbox } from "./ui/checkbox";
import { useUser } from "@/app/contexts/UserContext";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { checkIfHasTenant } from "@/lib/tenant";
import { updateUserPermission } from "@/lib/ums/systemHandlers/edit/updateUserPermission";
import { isPlanExpired } from "@/lib/utils";

interface UserManagementProps {
  planExpired: boolean;
}

export default function UserManagement({planExpired}: UserManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateAddDialogOpen, setIsCreateAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSystemQueryList, setSearchSystemQueryList] = useState<system[]>(
    []
  );
  const [selectedUser, setSelectedUser] = useState<user>({
    id: 0,
    name: "",
    email: "",
    username: "",
    password: "",
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
    ams_user_role_id: -1,
    qcms_user_id: -1,
    qcms_user_role_id: -1,
    tsms_user_id: -1,
    tsms_user_role_id: -1,
    tdms_user_id: -1,
    tdms_user_role_id: -1,
    hr_user_id: -1,
    hr_user_role_id: -1,
    chatess_user_id: -1,
    chatess_user_role_id: -1,
    chatess_workspace: -1,
    selected_systems: [],
    systems_with_permission: [],
    access: "",
    teams: [],
  });
  const [users, setUsers] = useState<user[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<user[]>([]);
  const [permissionedSystems, setPermissionedSystems] = useState<PermissionedSystem[]>([]);
  const [availableSystems, setAvailableSystems] = useState<system[]>([]);
  const [systemToAssign, setSystemToAssign] = useState<system | null>();
  const [systemToAdd, setSystemToAdd] = useState<system>("FMS");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasTenant, setHasTenant] = useState<boolean>(false);
  const [isTenantChecking, setTenantChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const { access_token, removeUserFromKeycloak, checkAndUpdateAccessToken, updateUserPermissionInKeycloak } = useAuth();

  const { user: loggedUser } = useUser();
  const { teams } = useData();

  const hasRun = useRef(false);

  let deletedSystemCount = 0;

  const totalPages = Math.ceil(users.length / itemsPerPage);

  const paginatedUsers = searchedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setIsLoading(true);

    if (!hasRun.current) {
      hasRun.current = true;
      init();
    }
  }, []);
  
  useEffect(() => {
     setIsExpired(isPlanExpired(loggedUser?.planExpiresAt));

    if (loggedUser?.planId) {
      fetchAvailableSystems();
    }
  }, [loggedUser]);

  useEffect(() => {
    if (!users) return;

    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery?.toLowerCase());

      const matchesSystem = searchSystemQueryList?.length === 0 || user.selected_systems?.some((system: system) => searchSystemQueryList?.includes(system));
      console.log("* user.selected_systems => ", typeof user.selected_systems);
      console.log("* searchSystemQueryList?.length => ", searchSystemQueryList?.length);
      console.log("* searchSystemQueryList=> ", typeof searchSystemQueryList);


      console.log("* matchesSystem => ", matchesSystem);

      return matchesSearch && matchesSystem;
    });

    setSearchedUsers(filtered);
  }, [searchQuery, users, searchSystemQueryList]);

  useEffect(() => {}, [selectedUser]);

  const init = async () => {
    const tokenOk = await checkAndUpdateAccessToken();
    
    await checkAdminRegisteration();
    
    const result = await fetchUsers();
    
    if(!tokenOk) {
      toastify.error("Server Error: currently you cant get keycloak access token!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
    }
    
    if (result) {
      toastify.success("Data loaded successfully!", {
        autoClose: 3000,
      });
    }

  };

  const checkAdminRegisteration = async () => {
    if (loggedUser?.email) {
      const checkingResponse = await checkIfHasTenant(loggedUser.email);
      if (!checkingResponse.error) {
        const tenantId = checkingResponse.data;
        if (tenantId) {
          setHasTenant(true);
        } else {
          setHasTenant(false);
        }
      } else {
        toastify.error("Error occured during tenant checking", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }

    setTenantChecking(false);
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
              setPermissionedSystems((prev) => {
                return [
                  ...prev,
                  { userId: data.id, systems: data.systems_with_permission },
                ];
              });
            }
          });

          setIsLoading(false);
          setUsers(fetchData);
          return true;
        } else {
          toastify.warning("Currently there is no data!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setIsLoading(false);
          setUsers([]);
          return false;
        }
      } else {
        setIsLoading(false);
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
    } catch (error) {
      setIsLoading(false);
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

  const fetchAvailableSystems = async () => {
    try {
      const response = await fetch("/api/payment/plans", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const fetchPlans = await response.json();

      // Check if fetchData is an array
      if (Array.isArray(fetchPlans)) {
        const matchedPlan = fetchPlans.find((p) => p.id === loggedUser?.planId);

        const rawSystems = matchedPlan?.systems;

        let systems: system[] = [];

        if (Array.isArray(rawSystems)) {
          systems = rawSystems.map((s: string) => s as system);
        } else if (typeof rawSystems === "string") {
          try {
            const parsed = JSON.parse(rawSystems);
            if (Array.isArray(parsed)) {
              systems = parsed.map((s: string) => s as system);
            }
          } catch (error) {
            console.error("Failed to parse systems string:", error);
          }
        }

        setAvailableSystems(systems);
        setSearchSystemQueryList(systems);
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error fetching available systems:", error);
    }
  };

  const fetchTeamName = (teamId: string): string => {
    const team = teams.find((team: Team) => team.teamId === Number(teamId));
    return team ? team.teamName : "Unknown Team";
  };

  const handleEditUser = (user: user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUserAssign = (user: user, system: system) => {
    setSystemToAssign(system);
    setIsAssignDialogOpen(true);
    setSelectedUser(user);
  };

  const handleRowsPerPageChange = ( event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Reset to page 1 when changing rows per page
  };

  const handleSendCredentialToUser = (user: user) => {
    setSelectedUser(user);

    setIsSendDialogOpen(true);
  };

  const handleDeleteUser = (user: user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
    setIsDeleting(false);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setIsPasswordResetDialogOpen(true);
  };

  const handleSystemSearchQuery = (system: system) => {
    console.log("* system => ", system);
    setSearchSystemQueryList((prev: system[]) => {
      return prev?.includes(system)
        ? prev.filter((s) => s != system)
        : [...prev, system];
    });
  };

  const addUpdatedUser = (user: user) => {
    const updatedUsers = users.map((u) => (u.id === user.id ? user : u));

    setUsers(updatedUsers);

    setPermissionedSystems((prev) => {
      const exists = prev.some((item) => item.userId === user.id);

      if (exists) {
        return prev.map((item) =>
          item.userId === user.id
            ? { ...item, systems: user.systems_with_permission }
            : item
        );
      } else {
        return [
          ...prev,
          { userId: user.id, systems: user.systems_with_permission },
        ];
      }
    });
  };

  const deleteUserFromSystem = async (system: string) => {
    const response = await fetch(`/api/ums/systems/delete/${system}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: selectedUser,
        accessToken: access_token,
      }),
    });

    const result = await response.json();

    if (result.success) {
      deletedSystemCount++;
      return true;
    }

    hotToast.error(result.error || `Failed to remove from ${system}`);
    return false;
  };

  const addMoreSystem = (user: user, system: system) => {
    setSystemToAdd(system);
    setIsCreateAddDialogOpen(true);
    setSelectedUser(user);
  };

  const addNewUser = async (newUser: user) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };
  
  const confirmSendUserCredential = async () => {
    if(isExpired) {
      toastify.warn("Sorry, your plan was expired.", { autoClose: 3000 });
      return;
    }

    setIsSending(true);

    const email = selectedUser?.email;
    const password = selectedUser?.password;
    const availableSystems = selectedUser?.selected_systems;
    const adminEmail = loggedUser?.email;

    let result = null;

    try {
      const res = await fetch("/api/ums/customers/send-credential", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          adminEmail,
          availableSystems,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toastify.error("Failed to send credentials");
        throw new Error(
          `Failed to send credentials: ${error.message || error}`
        );
      }

      result = await res.json();
      toastify.success("Sent credentials successfully!");
    } catch (err) {
      console.error("Error sending credentials:", err);
      toastify.error("Failed to send credentials");
    } finally {
      setIsSending(false);
      setIsSendDialogOpen(false);
    }

    return result;
  };

  const confirmDeleteUser = async () => {
    if(isExpired) {
      toastify.warn("Sorry, your plan was expired.", { autoClose: 3000 });
      return;
    }

    if (!selectedUser || !selectedUser.email) {
      hotToast.error("User data is missing");
      return;
    }

    deletedSystemCount = 0;

    setIsDeleting(true);

    try {
      const keycloakResponse = await removeUserFromKeycloak(selectedUser.email);

      if (keycloakResponse.error) {
        hotToast.error(`keycloak : ${keycloakResponse.message}`);
      } else {
        toastify.success("User was deleted from keycloak successfully", {
          autoClose: 2000,
        });
      }

      const systemDeletePromises = selectedUser.selected_systems.map((system) =>
        deleteUserFromSystem(system)
      );

      const systemDeleteResults = await Promise.allSettled(
        systemDeletePromises
      );

      const failedSystems = systemDeleteResults
        .map((result, index) =>
          result.status === "rejected"
            ? selectedUser.selected_systems[index]
            : null
        )
        .filter(Boolean);

      if (failedSystems.length > 0) {
        hotToast.error(
          `Failed to delete user from: ${failedSystems.join(", ")}`,
          { duration: 4000 }
        );
      }

      if (typeof selectedUser.id !== "number") {
        hotToast.error("User info is not correct!", {
          duration: 3000,
        });
      }

      const umsResponse = await fetch(`/api/ums/customers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ id: selectedUser.id }),
      });

      if (!umsResponse.ok) {
        throw new Error("Failed to delete user from UMS");
      }

      const contentType = umsResponse.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        toastify.success("User was deleted from UMS successfully");

        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== selectedUser.id)
        );
      }
    } catch (error: any) {
      hotToast.error(error.message || "Unexpected error during user deletion");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmUserAssign = async () => {
    if(isExpired) {
      toastify.warn("Sorry, your plan was expired.", { autoClose: 3000 });
      return;
    }

    if (!selectedUser?.email || !systemToAssign) {
      toastify.warning("Please select a user and system.");
      return;
    }

    setIsAssigning(true);

    const email = selectedUser.email;
    const system = systemToAssign;
    const isAssigned = !selectedUser.systems_with_permission.includes(system);
    const systemsWithPermission: system[] = isAssigned
      ? [...selectedUser.systems_with_permission, system]
      : selectedUser.systems_with_permission.filter(
          (s) => s !== systemToAssign
        );

    try {
      const responseFromKecloak = await updateUserPermissionInKeycloak(
        email,
        system,
        isAssigned
      );

      if (responseFromKecloak.error) {
        hotToast.error(responseFromKecloak.message);
        return;
      }

      const responseFromUMS = await updateUserPermission(
        selectedUser.id,
        systemsWithPermission
      );

      if (responseFromUMS.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  systems_with_permission: systemsWithPermission,
                }
              : user
          )
        );
        toastify.success("Updated permission successfully");
      } else {
        toastify.error(responseFromUMS.message || "Failed permission update");
      }
    } catch (err: any) {
      console.error("Error assigning user:", err);
      hotToast.error(err?.message || "Unexpected server error ocurred");
    } finally {
      setIsAssigning(false);
    }
  };

  const goToPage = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };


  if (isTenantChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-4 vh-96 overflow-y-auto px-2 sm:px-4">
      {hasTenant ? (
        <>
          <ToastContainer position="top-right" autoClose={800} />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <InputWrapper
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[300px]"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Systems
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 max-h-64 overflow-y-auto space-y-2">
                  {(Array.isArray(availableSystems)
                    ? availableSystems
                    : []
                  ).map((system: system) => (
                    <div key={system} className="flex items-center space-x-2">
                      <Checkbox className="border-[#1bb6f9] bg-[#1bb6f9]" id={system} onCheckedChange={() => handleSystemSearchQuery(system)} checked={searchSystemQueryList.includes(system)}/> <span>{system}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex w-full sm:w-auto justify-end sm:justify-start">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="w-full sm:w-auto bg-[#1bb6f9] hover:bg-[#3faedd]"
                disabled={planExpired}
              >
                <GroupAddIcon className="h-5 w-5 mr-2" />
                New User
              </Button>
            </div>
          </div>

          <div className="relative" style={{ height: "70vh" }}>
            {/* Scrollable Container */}
            <div className="overflow-x-auto h-[calc(70vh-60px)]">
              <Table className="min-w-[800px] w-full border-collapse">
                {/* Sticky Header */}
                <TableHeader
                  className="sticky top-0 shadow-md z-20"
                  style={{ position: "sticky", top: 0, zIndex: 20 }}
                >
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Systems</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                {/* Table Body with Scroll */}
                <TableBody className="" style={{ overflowY: "auto" }}>
                  {!isLoading &&
                    paginatedUsers?.map((user: user, index) => (
                      <TableRow key={user.id} className="fit-content h-12">
                        <TableCell>
                          {index + (currentPage - 1) * itemsPerPage + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.name}{" "}
                          {loggedUser?.email === user.email ? "( me )" : ""}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.password}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Tooltip.Provider>
                              {user.selected_systems?.map((system: system) => {
                                let roleId: string | number = -1;
                                if (system === "FMS")
                                  roleId = user.fms_user_role_id;
                                else if (system === "WMS")
                                  roleId = user.wms_user_role_id;
                                else if (system === "CRM")
                                  roleId = user.crm_user_role_id;
                                else if (system === "TMS")
                                  roleId = user.tms_user_role_id;
                                else if (system === "AMS")
                                  roleId = user.ams_user_role_id;
                                else if (system === "QCMS")
                                  roleId = user.qcms_user_role_id;
                                else if (system === "TSMS")
                                  roleId = user.tsms_user_role_id;
                                else if (system === "TDMS")
                                  roleId = user.tdms_user_role_id;
                                else if (system === "HR")
                                  roleId = user.hr_user_role_id;
                                else if (system === "CHATESS")
                                  roleId = user.chatess_user_role_id;
                                return (
                                  <Tooltip.Root key={system}>
                                    <Tooltip.Trigger
                                      className={`px-3 py-1 ${
                                        user.systems_with_permission.includes(
                                          system
                                        )
                                          ? "bg-blue-500"
                                          : "bg-blue-300"
                                      } text-white rounded-full cursor-pointer`}
                                      onClick={() => {
                                        handleUserAssign(user, system);
                                      }}
                                    >
                                      {system}
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content className="bg-gray-900 text-white p-2 rounded-md shadow-lg">
                                        <div>
                                          Role: {getRoleName(system, roleId)}
                                        </div>
                                        {system === "FMS" && (
                                          <div className="w-[200px]">
                                            Branch:{" "}
                                            {Array.isArray(user?.fms_branch)
                                              ? user.fms_branch
                                                  .map((branchId) =>
                                                    getBranchName(branchId)
                                                  )
                                                  .join(", ")
                                              : "N/A"}
                                          </div>
                                        )}
                                        {system === "TMS" && (
                                          <div className="w-[200px]">
                                            Team:{" "}
                                            {user?.access === "0"
                                              ? (() => {
                                                  let teams: string[] = [];

                                                  if (
                                                    typeof user.teams ===
                                                    "string"
                                                  ) {
                                                    try {
                                                      // Try to parse the string safely
                                                      teams = JSON.parse(
                                                        (
                                                          user.teams as string
                                                        ).replace(/'/g, '"')
                                                      );
                                                    } catch (err) {
                                                      console.warn(
                                                        "Failed to parse user.teams:",
                                                        user.teams
                                                      );
                                                    }
                                                  } else if (
                                                    Array.isArray(user.teams)
                                                  ) {
                                                    teams = user.teams;
                                                  }

                                                  return teams.length > 0
                                                    ? teams
                                                        .map((teamId) =>
                                                          fetchTeamName(teamId)
                                                        )
                                                        .filter(Boolean)
                                                        .join(", ")
                                                    : "N/A";
                                                })()
                                              : "All Teams"}
                                          </div>
                                        )}

                                        <Tooltip.Arrow className="fill-gray-900" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                );
                              })}

                              {Array.isArray(availableSystems)
                                ? availableSystems
                                    .filter(
                                      (system: system) =>
                                        !user.selected_systems?.includes(system)
                                    )
                                    .map((system: system) => (
                                      <Tooltip.Provider key={system}>
                                        <Tooltip.Root>
                                          <Tooltip.Trigger
                                            className="px-3 py-1 bg-gray-500 text-white rounded-full cursor-pointer"
                                            onClick={() =>
                                              addMoreSystem(user, system)
                                            }
                                          >
                                            {system}
                                          </Tooltip.Trigger>
                                          <Tooltip.Portal>
                                            <Tooltip.Content className="bg-gray-900 text-white p-2 rounded-md shadow-lg">
                                              <div>Click to add {system}</div>
                                              <Tooltip.Arrow className="fill-gray-900" />
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        </Tooltip.Root>
                                      </Tooltip.Provider>
                                    ))
                                : null}
                            </Tooltip.Provider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                                disabled={planExpired}
                              >
                                <Edit className="h-4 w-4 mr-2"/>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-black"
                                onClick={() => handleSendCredentialToUser(user)}
                                disabled={planExpired}
                              >
                                <Send className="h-4 w-4 mr-2 " />
                                Send to User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user)}
                                disabled={planExpired}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {isLoading && (
                <div className="flex items-center justify-center w-full absolute h-[60vh]">
                  <div className="loader" />
                </div>
              )}
            </div>

            {/* Pagination and Row Selection */}
            <div className="absolute bottom-0 left-0 right-0 bg-white py-2 px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={goToPage}
                />
              </Stack>

              <Stack spacing={2} direction="row" alignItems="center">
                <Typography>Counts :</Typography>
                <Select
                  value={itemsPerPage}
                  //@ts-ignore
                  onChange={handleRowsPerPageChange}
                  size="small"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </Stack>
            </div>
          </div>

          <CreateUserDialog
            availableSystems={availableSystems}
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            addNewUser={addNewUser}
          />

          <AddMoreUserDialog
            open={isCreateAddDialogOpen}
            onOpenChange={setIsCreateAddDialogOpen}
            user={selectedUser}
            addUpdatedUser={addUpdatedUser}
            system={systemToAdd}
          />

          {selectedUser && (
            <EditUserDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              user={selectedUser}
              addUpdatedUser={addUpdatedUser}
            />
          )}
          <AlertDialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {systemToAssign &&
                  selectedUser?.systems_with_permission.includes(systemToAssign)
                    ? "This action will unassign from system."
                    : "This action will assign to system."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <button
                  onClick={async () => {
                    setIsAssigning(true);
                    try {
                      await confirmUserAssign();
                      setIsAssignDialogOpen(false);
                    } finally {
                      setIsAssigning(false);
                    }
                  }}
                  disabled={isAssigning}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md"
                >
                  {isAssigning ? "Request..." : "Request"}
                </button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete the user
                  <span className="font-semibold"> {selectedUser?.name}</span>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await confirmDeleteUser();
                      setIsDeleteDialogOpen(false);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={isSendDialogOpen}
            onOpenChange={setIsSendDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  The credential will be sent to
                  <span className="font-semibold"> {selectedUser?.name}</span>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button
                    onClick={async (e) => {
                      e.preventDefault(); // prevent auto-close
                      await confirmSendUserCredential(); // control everything in here
                    }}
                    className="bg-[#1bb6f9] text-white hover:bg-[#1bb6f9]"
                    disabled={isSending}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {selectedUser && (
            <PasswordResetDialog
              open={isPasswordResetDialogOpen}
              onOpenChange={setIsPasswordResetDialogOpen}
              userId={selectedUser.id}
              userName={selectedUser.name}
            />
          )}
        </>
      ) : (
        <p className="text-black">
          {" "}
          ⚠ Sorry, you did not register your tenant yet.
        </p>
      )}
    </div>
  );
}
