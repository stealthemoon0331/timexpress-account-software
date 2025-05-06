"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminSubscriptionsTab } from "./subscription/adminSubscriptionTab";
import { Plan } from "@/lib/data";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

interface UserType {
  id: string;
  name: string;
  image: string;
  email: string;
  planId: string | null;
  createdAt: Date | null;
  planActivatedAt: Date | null;
  planExpiresAt: Date | null;
  lastLoginAt: Date | null;
}

export default function AdminPage() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlanId, setNewPlanId] = useState<string>("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState<UserType[]>([]);
  // const [stats, setStats] = useState
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const syncPlans = async () => {
      try {
        const res = await fetch("/api/payment/plans", { method: "GET" });
        if (!res.ok) throw new Error("Failed to sync plans");

        const responseData = await res.json();

        const parsedPlans = responseData.map((plan: any) => ({
          ...plan,
          features:
            typeof plan.features === "string"
              ? JSON.parse(plan.features)
              : plan.features,
        }));

        setPlans(parsedPlans);
      } catch (err) {
        console.error("Error loading plans:", err);
      }
    };

    syncPlans();
  }, []);

  const planMap = useMemo(() => {
    const map = new Map();
    plans?.forEach((plan) => map.set(plan.id, plan.name));
    return map;
  }, [plans]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const userStatus =
      user.planExpiresAt && new Date(user.planExpiresAt) > new Date()
        ? "active"
        : "inactive";
    const matchesStatus = statusFilter === "all" || userStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats for the dashboard

  const totalUsersNumber = users.length;
  const activeSubscriptionsNumber = users.filter(
    (f) => f.planExpiresAt && new Date(f.planExpiresAt) > new Date()
  ).length;
  const monthlyRevenue = users.reduce((total, user) => {
    const isActive =
      user.planExpiresAt && new Date(user.planExpiresAt) > new Date();
    if (!isActive || !user.planId) return total;

    const userPlan = plans?.find((plan) => plan.id === user.planId);
    return total + (userPlan?.price || 0);
  }, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = users.filter(
    (user) => user.lastLoginAt && new Date(user.lastLoginAt) > thirtyDaysAgo
  );

  const stats = [
    {
      title: "Total Users",
      value: totalUsersNumber.toString(),
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptionsNumber.toString(),
      change: "+8%",
      trend: "up",
    },
    {
      title: "Monthly Revenue",
      value: "$ " + monthlyRevenue.toString(),
      change: "+15%",
      trend: "up",
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      change: "+3%",
      trend: "up",
    },
  ];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "users.xlsx");
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, subscriptions, and system settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Button className="bg-upwork-green hover:bg-upwork-darkgreen text-white"
           onClick={exportToExcel}>
            <Icons.download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p
                    className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-upwork-green" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="mb-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          {/* <TabsTrigger value="organizations">Organizations</TabsTrigger> */}
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                View and manage all users in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Joined</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            {(currentPage - 1) * 10 + index + 1}
                          </TableCell>
                          <TableCell>
                            <img
                              src={
                                user.image
                                  ? user.image
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      user?.name || "User"
                                    )}&background=ccc&color=555&rounded=true`
                              }
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                user.planExpiresAt &&
                                new Date(user.planExpiresAt) > new Date()
                                  ? "bg-upwork-lightgreen text-upwork-green"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.planExpiresAt &&
                              new Date(user.planExpiresAt) > new Date()
                                ? "Active"
                                : "Inactive"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.planId
                              ? planMap.get(user.planId) || "Unknown Plan"
                              : "No Plan"}
                          </TableCell>
                          <TableCell>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewPlanId(user.planId || "");
                                  setShowPlanModal(true);
                                }}
                              >
                                <Icons.edit className="h-4 w-4" />
                                <span className="sr-only">Plan Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsResetModalOpen(true);
                                }}
                              >
                                <Icons.key className="h-4 w-4" />
                                <span className="sr-only">Reset Password</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length > 0 ? 1 : 0} to{" "}
              {filteredUsers.length} of {filteredUsers.length} users
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </TabsContent>
        {/* <TabsContent value="organizations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Manage organizations and their subscriptions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Select the Organizations tab to view and manage organizations.
              </p>
            </CardContent>
          </Card>
        </TabsContent> */}
        <TabsContent value="subscriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                Manage subscription plans and billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Select the Subscriptions tab to view and manage subscription
                plans.
              </p>
              <AdminSubscriptionsTab />
            </CardContent>
          </Card>
        </TabsContent>
        {/* <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Select the Settings tab to configure system settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter a new password for <strong>{selectedUser?.name}</strong>
            </p>
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={async () => {
                if (!selectedUser) return;

                try {
                  const res = await fetch(
                    `/api/admin/users/${selectedUser.id}/reset-password`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ password: newPassword }),
                    }
                  );

                  if (!res.ok) throw new Error("Reset failed");

                  const resData = await res.json();
                  console.log(resData);
                  toast.success(resData.message);
                  setIsResetModalOpen(false);
                  setNewPassword("");
                } catch (err) {
                  alert("Failed to reset password.");
                }
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/2 bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Update Plan for {selectedUser.name}
            </h2>
            <Select value={newPlanId} onValueChange={setNewPlanId}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select a new plan" />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowPlanModal(false)}>
                Cancel
              </Button>
              <Button
                disabled={loadingUpdate}
                onClick={async () => {
                  if (!newPlanId) return;
                  setLoadingUpdate(true);
                  const res = await fetch(
                    `/api/admin/users/${selectedUser.id}/update-plan`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ planId: newPlanId }),
                    }
                  );

                  if (res.ok) {
                    const updatedUser = await res.json();
                    setUsers((prev) =>
                      prev.map((user) =>
                        user.id === updatedUser.id ? updatedUser : user
                      )
                    );
                    
                    toast.success("Successfully plan updated!");

                    setShowPlanModal(false);

                    const resUsers = await fetch("/api/admin/users");
                    const data = await resUsers.json();
                    setUsers(data);
                  } else {
                    alert("Failed to update plan");
                  }
                  setLoadingUpdate(false);
                }}
              >
                {loadingUpdate ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
