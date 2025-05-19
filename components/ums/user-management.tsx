"use client";

import { use, useEffect, useRef, useState } from "react";
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Key,
  Link,
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

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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
import {
  CRM_API_PATH,
  FMS_API_PATH,
  TMS_API_PATH,
  WMS_API_PATH,
} from "@/app/config/setting";
import { getBranchName, getRoleName } from "@/lib/ums/utils";
import {
  FailedSystem,
  PermissionedSystem,
  system,
  Team,
  user,
} from "@/lib/ums/type";
import { toast, ToastContainer, toast as toastify } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import "@/lib/ums/css/loading.css";
import {
  MenuItem,
  PaginationItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { AddMoreUserDialog } from "./add-more-user-dialog";
import { set } from "date-fns";
import InputWrapper from "./input-wrapper";
import { useData } from "@/app/contexts/dataContext";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useUser } from "@/app/contexts/UserContext";
import { consoleLog } from "@/lib/utils";

export default function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateAddDialogOpen, setIsCreateAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] =
    useState(false);
  const [availableSystems, setAvailableSystems] = useState<system[]>([]);
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
    selected_systems: [],
    systems_with_permission: [],
    access: "",
    teams: [],
  });
  const [users, setUsers] = useState<user[]>([]);

  const [searchedUsers, setSearchedUsers] = useState<user[]>([]);

  const [updateFailedSystems, setUpdateFailedSystems] = useState<
    FailedSystem[]
  >([]);

  const [permissionedSystems, setPermissionedSystems] = useState<
    PermissionedSystem[]
  >([]);

  const [deletedSystem, setDeletedSystem] = useState({
    FMS: false,
    CRM: false,
    WMS: false,
    TMS: false,
    count: 0,
  });

  const [systemToAdd, setSystemToAdd] = useState<system>("FMS");

  const { access_token, removeUserFromKeycloak } = useAuth();

  const { teams } = useData();

  let deletedSystemCount = 0;

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / itemsPerPage);

  useEffect(() => {
    if (!users) return;

    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery?.toLowerCase());

      const matchesSystem =
        searchSystemQueryList?.length === 0 ||
        user.selected_systems?.some((system) =>
          searchSystemQueryList?.includes(system)
        );

      return matchesSearch && matchesSystem;
    });

    setSearchedUsers(filtered);
  }, [searchQuery, users, searchSystemQueryList]);

  // useEffect(() => {
  //   setSearchedUsers(
  //     users?.filter((user) => {
  //       return (
  //         user?.selected_systems.some(s => searchSystemQueryList.includes(s))
  //       );
  //     })
  //   );
  // }, [searchSystemQueryList, users]);

  const paginatedUsers = searchedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { checkAndUpdateAccessToken } = useAuth();

  const hasRun = useRef(false);
  const { user: loggedUser } = useUser();

  useEffect(() => {
    setIsLoading(true);
    // Fetch users from the API
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
                JSON.parse(data.systems_with_permission).map(
                  (system: system) => {
                    systems_with_permission.push(system);
                  }
                );
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

    const init = async () => {
      await checkAndUpdateAccessToken();
      const result = await fetchUsers();
      if (result) {
        toastify.success("Data loaded successfully!", {
          autoClose: 3000,
        });
      }
    };

    if (!hasRun.current) {
      hasRun.current = true;
      init();
    }
  }, []);

  useEffect(() => {
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
          setAvailableSystems(
            fetchPlans.find((p) => p.id === loggedUser?.planId)?.systems
          );
          setSearchSystemQueryList(
            fetchPlans.find((p) => p.id === loggedUser?.planId)?.systems
          );
        } else {
          console.log("fetch plans error");
          return false;
        }
      } catch (error) {}
    };

    fetchAvailableSystems();
  }, [loggedUser]);
  const handleEditUser = (user: user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
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

  const getTeamName = (teamId: string): string => {
    console.log(teamId);
    const team = teams.find((team: Team) => team.teamId === Number(teamId));
    return team ? team.teamName : "Unknown Team";
  };

  const handleSendCredentialToUser = (user: user) => {
    setSelectedUser(user);
    setIsSending(true);
  };

  const handleDeleteUser = (user: user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
    setIsDeleting(false);
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
      // toastify.success(`User removed from ${system} successfully!`);
      setDeletedSystem((prev) => ({
        ...prev,
        [system]: true,
        count: prev.count + 1,
      }));
      deletedSystemCount++;
      return true;
    }

    hotToast.error(result.error || `Failed to remove from ${system}`);
    return false;
  };

  const confirmSendUserCredential = async () => {
    consoleLog("selectedUser", selectedUser);
    consoleLog("user email", selectedUser?.email);
    consoleLog("user password", selectedUser?.password);
    consoleLog("user selected systems", selectedUser?.selected_systems);
    consoleLog("admin email", loggedUser?.email);
    setIsSendDialogOpen(true);

    const email = selectedUser?.email;
    const password = selectedUser?.password;
    const availableSystems = selectedUser?.selected_systems;
    const adminEmail = loggedUser?.email;

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
        toast.error("Failed to send credentials");
        throw new Error("Failed to send credentials");
      }

      toast.success("Sent credentials successfully!");
      setIsSendDialogOpen(false);
      return await res.json(); // { success: true }
    } catch (err) {
      console.error("Error sending credentials:", err);
      toast.error("Failed to send credentials");
      throw err;
    }
  };

  const confirmDeleteUser = async () => {
    deletedSystemCount = 0;

    setIsDeleting(true);

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

    await Promise.allSettled(systemDeletePromises);

    if (typeof selectedUser.id !== "number") {
      hotToast.error("User info is not correct!", {
        duration: 3000,
      });
    }

    await fetch(`/api/ums/customers`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access_token,
      },
      body: JSON.stringify({
        id: selectedUser.id,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("application/json")) {
            toastify.success("User was deleted from UMS successfully");

            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== selectedUser.id)
            );
            setDeletedSystem({
              FMS: false,
              CRM: false,
              WMS: false,
              TMS: false,
              count: 0,
            });
          } else {
            console.warn("Response is empty or not JSON");
          }
        }
      })
      .catch((error) => {
        hotToast.error("Server Error: can not delete user");
      });

    setIsDeleting(false);

    setIsDeleteDialogOpen(false);
  };

  const addMoreSystem = (user: user, system: system) => {
    // const updatedUser = {
    //   ...selectedUser,
    //   selected_systems: [...selectedUser.selected_systems, system],
    // };
    // setSelectedUser(updatedUser);
    setSystemToAdd(system);
    setIsCreateAddDialogOpen(true);
    setSelectedUser(user);
  };

  const getUpdateFailedSystems = (userId: number, systems: system[]) => {
    console.log(userId, systems);
    setUpdateFailedSystems((prev) => [...prev, { userId, systems }]);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setIsPasswordResetDialogOpen(true);
  };

  const handleSystemSearchQuery = (system: system) => {
    setSearchSystemQueryList((prev: system[]) => {
      return prev?.includes(system)
        ? prev.filter((s) => s != system)
        : [...prev, system];
    });

    console.log("searchSystemQueryList => ", searchSystemQueryList);
  };

  const addNewUser = async (newUser: user) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const goToPage = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Reset to page 1 when changing rows per page
  };

  return (
    <div className="space-y-4 vh-96">
      <ToastContainer position="top-right" autoClose={800} />
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <InputWrapper
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>

          {availableSystems?.map((system: system) => (
            <div key={system} className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={system}
                  checked={searchSystemQueryList?.includes(system)}
                  onCheckedChange={() => handleSystemSearchQuery(system)}
                />
                <Label htmlFor={system} className="font-normal">
                  {system}
                </Label>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <GroupAddIcon className="h-8 w-8" />
          New User
        </Button>
      </div>
      <div className="relative" style={{ height: "70vh" }}>
        {/* Scrollable Container */}
        <div className="overflow-y-auto h-[calc(70vh-60px)]">
          <Table className="w-full border-collapse">
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
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Tooltip.Provider>
                          {user.selected_systems?.map((system: system) => {
                            let roleId = -1;
                            if (system === "FMS")
                              roleId = user.fms_user_role_id;
                            else if (system === "WMS")
                              roleId = user.wms_user_role_id;
                            else if (system === "CRM")
                              roleId = user.crm_user_role_id;
                            else if (system === "TMS")
                              roleId = user.tms_user_role_id;
                            return (
                              <Tooltip.Root key={system}>
                                <Tooltip.Trigger
                                  className={`px-3 py-1 bg-blue-500 text-white rounded-full cursor-pointer`}
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
                                                typeof user.teams === "string"
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
                                                      getTeamName(teamId)
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

                          {availableSystems
                            ?.filter(
                              (system: system) =>
                                !user.selected_systems?.includes(system)
                            )
                            .map((system: system) => (
                              <Tooltip.Provider key={system}>
                                <Tooltip.Root>
                                  <Tooltip.Trigger
                                    className="px-3 py-1 bg-gray-500 text-white rounded-full cursor-pointer"
                                    onClick={() => addMoreSystem(user, system)}
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
                            ))}
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
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-black"
                            onClick={() => handleSendCredentialToUser(user)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send to User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delet
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
        <div className="absolute bottom-0 left-0 right-0 bg-white py-2 flex justify-center">
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
          getUpdateFailedSystems={getUpdateFailedSystems}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user
              <span className="font-semibold"> {selectedUser?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              The credential will be sent to
              <span className="font-semibold"> {selectedUser?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSendUserCredential}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSending ? "Sending..." : "Send"}
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
    </div>
  );
}
