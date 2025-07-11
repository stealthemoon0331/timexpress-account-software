"use client";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import UserManagement from "@/components/ums/user-management";
import { Tabs, TabsContent } from "@/components/ums/ui/tabs";
// import { AuthProvider, useAuth } from "@/contexts/authContext";
import { Toaster } from "react-hot-toast";
import { DataProvider } from "@/app/contexts/dataContext";
import { AuthProvider } from "@/app/contexts/authContext";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import SystemRegisteration from "@/components/ums/system-registeration";


export default function page() {

  return (
    <AuthProvider>
      <DataProvider>
        <main className="container mx-auto p-4 md:p-6">
          {/* <ToastContainer position="top-right" autoClose={800} /> */}
          <Toaster position="bottom-right" reverseOrder={false} />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Portal Management</h1>
          </div>
          <Tabs defaultValue="systems" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="systems">Register to System</TabsTrigger>
              <TabsTrigger
                value="customers"
              >
                Users
              </TabsTrigger>
              {/* <TabsTrigger value="roles">Roles</TabsTrigger> */}
            </TabsList>
            <TabsContent value="systems" className="mt-6">
              <SystemRegisteration />
            </TabsContent>
            <TabsContent value="customers" className="mt-6">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </main>
      </DataProvider>
    </AuthProvider>
  );
}
