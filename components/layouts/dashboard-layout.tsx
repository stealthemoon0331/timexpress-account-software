"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import { isPlanExpired } from "@/lib/utils";
import { useUser } from "@/app/contexts/UserContext";
import NotificationBell from "@/lib/notification-bell";
import ProfileAvatar from "../ui/profileAvatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const { user: loggedUser } = useUser();

  const routes = [
    {
      href: "/dashboard/overview",
      label: "Overview",
      icon: Icons.dashboard,
      active: pathname === "/dashboard/overview",
    },
    {
      href: "/dashboard/customers",
      label: "customers",
      icon: Icons.users,
      active: pathname.startsWith("/dashboard/customers"),
      disabled: isPlanExpired(loggedUser?.planExpiresAt),
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: Icons.creditCard,
      active: pathname.startsWith("/dashboard/billing"),
    },
    {
      href: "/dashboard/account",
      label: "Account",
      icon: Icons.settings,
      active: pathname.startsWith("/dashboard/account"),
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="gap-4">
          <SidebarHeader className="bg-white">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Shiper.io"
                width={32}
                height={32}
                className="w-[60%] p-4"
              />
              {/* <span className="text-3xl font-bold">Shiper.io</span> */}
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4 bg-white">
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={route.active}
                    disabled={route.disabled}
                    className={`
            group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200
            ${
              route.active
                ? "bg-blue-50 text-[#1bb6f9] font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }
            ${
              route.disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
          `}
                  >
                    <Link href={route.href}>
                      <route.icon
                        className={`
                h-6 w-6 transition-colors
                ${
                  route.active
                    ? "text-[#1bb6f9]"
                    : "text-gray-500 group-hover:text-gray-800"
                }
              `}
                      />
                      <span className="text-base">{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="bg-white">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <ProfileAvatar loggedUser={loggedUser} />
                <div className="text-sm">
                  <p className="font-medium">{loggedUser?.name}</p>
                  {/* <p className="text-xs text-muted-foreground">Admin</p> */}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Icons.ellipsis className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account">
                      <Icons.settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut({ callbackUrl: "/login" });
                    }}
                  >
                    <Icons.logout className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <NotificationBell />
              {/* <Button variant="outline" size="icon" className="relative">
                <Icons.bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-upwork-green text-xs text-white">
                    {notifications}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <ProfileAvatar loggedUser={loggedUser} />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account">
                      <Icons.settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut({ callbackUrl: "/login" });
                    }}
                  >
                    <Icons.logout className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
