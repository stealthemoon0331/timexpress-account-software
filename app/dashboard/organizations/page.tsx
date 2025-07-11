"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data - in a real app, this would come from an API
  const organizations = [
    {
      id: "1",
      name: "Acme Inc",
      members: 12,
      plan: "Annual",
      status: "active",
      createdAt: "Apr 15, 2025",
    },
    {
      id: "2",
      name: "Globex Corporation",
      members: 8,
      plan: "Monthly",
      status: "active",
      createdAt: "Apr 10, 2025",
    },
    {
      id: "3",
      name: "Initech",
      members: 5,
      plan: "Free Trial",
      status: "trial",
      createdAt: "Apr 18, 2025",
    },
    {
      id: "4",
      name: "Umbrella Corporation",
      members: 20,
      plan: "Annual",
      status: "active",
      createdAt: "Mar 25, 2025",
    },
    {
      id: "5",
      name: "Stark Industries",
      members: 15,
      plan: "Monthly",
      status: "active",
      createdAt: "Apr 5, 2025",
    },
  ]

  const filteredOrganizations = organizations.filter((org) => org.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-[#1bb6f9]">Active</Badge>
      case "trial":
        return <Badge className="bg-[#1bb6f9]">Trial</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage organizations and their subscriptions.</p>
        </div>
        <Button className="bg-[#1bb6f9] hover:bg-[#1bb6f9] text-white">
          <Icons.plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No organizations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/organizations/${org.id}`} className="hover:underline">
                      {org.name}
                    </Link>
                  </TableCell>
                  <TableCell>{org.members}</TableCell>
                  <TableCell>{org.plan}</TableCell>
                  <TableCell>{getStatusBadge(org.status)}</TableCell>
                  <TableCell>{org.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icons.ellipsis className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/organizations/${org.id}`}>
                            <Icons.eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icons.edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Icons.creditCard className="mr-2 h-4 w-4" />
                          <span>Manage Subscription</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icons.users className="mr-2 h-4 w-4" />
                          <span>Manage Members</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Icons.trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
