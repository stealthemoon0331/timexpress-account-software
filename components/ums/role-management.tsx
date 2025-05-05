"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateRoleDialog } from "@/components/ums/create-role-dialog"
import InputWrapper from "./input-wrapper"

// Mock data for demonstration
const systemRoles = {
  CRM: [
    { id: "1", name: "Admin", description: "Full access to CRM", permissions: ["read", "write", "delete"] },
    { id: "2", name: "Manager", description: "Can manage customers and deals", permissions: ["read", "write"] },
    { id: "3", name: "User", description: "Basic CRM access", permissions: ["read"] },
  ],
  WMS: [
    {
      id: "1",
      name: "Warehouse Admin",
      description: "Full warehouse management",
      permissions: ["read", "write", "delete"],
    },
    { id: "2", name: "Inventory Manager", description: "Manage inventory", permissions: ["read", "write"] },
    { id: "3", name: "User", description: "View inventory only", permissions: ["read"] },
  ],
  FMS: [
    { id: "1", name: "Fleet Admin", description: "Full fleet management", permissions: ["read", "write", "delete"] },
    { id: "2", name: "Dispatcher", description: "Manage dispatches", permissions: ["read", "write"] },
    { id: "3", name: "Driver", description: "View assigned deliveries", permissions: ["read"] },
  ],
}

export default function RoleManagement() {
  const [activeSystem, setActiveSystem] = useState("CRM")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRoles = systemRoles[activeSystem as keyof typeof systemRoles].filter(
    (role) =>
      role.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery?.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <Tabs defaultValue="CRM" value={activeSystem} onValueChange={setActiveSystem} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="CRM">CRM Roles</TabsTrigger>
            <TabsTrigger value="WMS">WMS Roles</TabsTrigger>
            <TabsTrigger value="FMS">FMS Roles</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        {Object.keys(systemRoles).map((system) => (
          <TabsContent key={system} value={system} className="space-y-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                <InputWrapper
                  placeholder={`Search ${system} roles...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <Badge key={permission} variant="outline">
                              {permission}
                            </Badge>
                          ))}
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
            </div>
          </TabsContent>
        ))}      </Tabs>

      <CreateRoleDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} system={activeSystem} />
    </div>
  )
}

