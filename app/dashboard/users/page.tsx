"use client";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ThemeToggle from "@/components/ums/theme-toggle";
import UserManagement from "@/components/ums/user-management";
import { Tabs, TabsContent } from "@/components/ums/ui/tabs";
import Profile from "@/components/ums/profile";
// import { AuthProvider, useAuth } from "@/contexts/authContext";
import { Toaster } from "react-hot-toast";
import ProfileWrapper from "@/components/ums/profile-wrapper";
import { DataProvider } from "@/app/contexts/dataContext";
import { AuthProvider } from "@/app/contexts/authContext";

export default function page() {
  return (
    <AuthProvider>
      <DataProvider>
        <main className="container mx-auto p-4 md:p-6">
          <ToastContainer position="top-right" autoClose={800} />
          <Toaster position="bottom-right" reverseOrder={false} />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              Your Customers
            </h1>
            {/* <div className="flex gap-2 items-center">
              <ProfileWrapper />
              <ThemeToggle />
            </div> */}
          </div>
          <Tabs defaultValue="users" className="w-full">
            {/* <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
          </TabsList> */}
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>
            {/* <TabsContent value="roles" className="mt-6">
            <RoleManagement />
          </TabsContent>
          <TabsContent value="systems" className="mt-6">
            <SystemIntegration />
          </TabsContent> */}
          </Tabs>
        </main>
      </DataProvider>
    </AuthProvider>
  );
}
