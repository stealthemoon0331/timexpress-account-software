"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import InputWrapper from "./input-wrapper"

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  system: string
}

// System-specific permission sets
const systemPermissions = {
  CRM: [
    { id: "view-customers", label: "View Customers" },
    { id: "edit-customers", label: "Edit Customers" },
    { id: "delete-customers", label: "Delete Customers" },
    { id: "view-deals", label: "View Deals" },
    { id: "edit-deals", label: "Edit Deals" },
    { id: "delete-deals", label: "Delete Deals" },
    { id: "view-reports", label: "View Reports" },
    { id: "manage-users", label: "Manage Users" },
  ],
  WMS: [
    { id: "view-inventory", label: "View Inventory" },
    { id: "edit-inventory", label: "Edit Inventory" },
    { id: "view-warehouses", label: "View Warehouses" },
    { id: "manage-warehouses", label: "Manage Warehouses" },
    { id: "view-shipments", label: "View Shipments" },
    { id: "process-shipments", label: "Process Shipments" },
    { id: "view-reports", label: "View Reports" },
    { id: "manage-users", label: "Manage Users" },
  ],
  FMS: [
    { id: "view-vehicles", label: "View Vehicles" },
    { id: "manage-vehicles", label: "Manage Vehicles" },
    { id: "view-drivers", label: "View Drivers" },
    { id: "manage-drivers", label: "Manage Drivers" },
    { id: "view-routes", label: "View Routes" },
    { id: "edit-routes", label: "Edit Routes" },
    { id: "view-reports", label: "View Reports" },
    { id: "manage-users", label: "Manage Users" },
  ],
}

export function CreateRoleDialog({ open, onOpenChange, system }: CreateRoleDialogProps) {
  const [roleName, setRoleName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  const handleSubmit = () => {

    // Reset form and close dialog
    setRoleName("")
    setDescription("")
    setSelectedPermissions([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create {system} Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">
              Role Name <span className="text-destructive">*</span>
            </Label>
            <InputWrapper
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {systemPermissions[system as keyof typeof systemPermissions].map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                  />
                  <Label htmlFor={permission.id} className="font-normal text-sm">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!roleName}>
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

