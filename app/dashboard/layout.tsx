"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [notifications] = useState(3) // Mock notification count

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Icons.dashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/organizations",
      label: "Organizations",
      icon: Icons.users,
      active: pathname.startsWith("/dashboard/organizations"),
    },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: Icons.user,
      active: pathname.startsWith("/dashboard/users"),
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: Icons.package,
      active: pathname.startsWith("/dashboard/products"),
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: Icons.creditCard,
      active: pathname.startsWith("/dashboard/billing"),
    },
    {
      href: "/dashboard/usage",
      label: "Usage",
      icon: Icons.barChart,
      active: pathname.startsWith("/dashboard/usage"),
    },
    {
      href: "/dashboard/account",
      label: "Account",
      icon: Icons.settings,
      active: pathname.startsWith("/dashboard/account"),
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 px-2">
              <Image src="/logo.svg" alt="Shiper.io" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold">Shiper.io</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={route.active}>
                    <Link href={route.href}>
                      <route.icon className="h-5 w-5" />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=32&width=32"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-upwork-green"></span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
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
                  <DropdownMenuItem>
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
              <Button variant="outline" size="icon" className="relative">
                <Icons.bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-upwork-green text-xs text-white">
                    {notifications}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Image
                      src="/placeholder.svg?height=32&width=32"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
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
                  <DropdownMenuItem>
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
  )
}
