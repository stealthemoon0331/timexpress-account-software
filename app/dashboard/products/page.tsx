"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("grid")

  // Mock data - in a real app, this would come from an API
  const products = [
    {
      id: "1",
      name: "Shypri CRM",
      description: "Customer relationship management system",
      icon: "/icons/crm.svg",
      users: 1245,
      organizations: 42,
      status: "active",
    },
    {
      id: "2",
      name: "Fleetp Fleet Mgt",
      description: "Fleet management system",
      icon: "/icons/fleet.svg",
      users: 876,
      organizations: 31,
      status: "active",
    },
    {
      id: "3",
      name: "WMS Ninja Inventory",
      description: "Warehouse management system",
      icon: "/icons/inventory.svg",
      users: 1532,
      organizations: 56,
      status: "active",
    },
    {
      id: "4",
      name: "ShypV B2C E-Commerce",
      description: "E-commerce platform",
      icon: "/icons/ecommerce.svg",
      users: 654,
      organizations: 28,
      status: "active",
    },
    {
      id: "5",
      name: "ShypRTO Reverse Logistics",
      description: "Return management system",
      icon: "/icons/reverse.svg",
      users: 423,
      organizations: 19,
      status: "active",
    },
    {
      id: "6",
      name: "Transport Management Software(TMS)",
      description: "Transport management system",
      icon: "/icons/tms.svg",
      users: 987,
      organizations: 37,
      status: "active",
    },
  ]

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage products and monitor usage.</p>
        </div>
        <Button className="bg-[#1bb6f9] hover:bg-[#1bb6f9] text-white">
          <Icons.plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={setView} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">
                <Icons.layoutGrid className="mr-2 h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <Icons.layoutList className="mr-2 h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Image src={product.icon || "/placeholder.svg"} alt={product.name} width={24} height={24} />
                  </div>
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{product.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Users</p>
                    <p className="text-2xl font-bold">{product.users}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                    <p className="text-2xl font-bold">{product.organizations}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge className="bg-[#1bb6f9]">Active</Badge>
                <Button variant="outline" size="sm">
                  <Icons.barChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Product</th>
                <th className="p-4 text-left font-medium">Users</th>
                <th className="p-4 text-left font-medium">Organizations</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <Image src={product.icon || "/placeholder.svg"} alt={product.name} width={24} height={24} />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{product.users}</td>
                  <td className="p-4">{product.organizations}</td>
                  <td className="p-4">
                    <Badge className="bg-upwork-green">Active</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon">
                      <Icons.ellipsis className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
