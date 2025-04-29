"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export function DashboardStats() {
  // Mock data - in a real app, this would come from an API
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: Icons.users,
    },
    {
      title: "Active Organizations",
      value: "56",
      change: "+3%",
      trend: "up",
      icon: Icons.layers,
    },
    {
      title: "Revenue (MTD)",
      value: "$12,543",
      change: "+8%",
      trend: "up",
      icon: Icons.creditCard,
    },
    {
      title: "Active Subscriptions",
      value: "987",
      change: "-2%",
      trend: "down",
      icon: Icons.barChart,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.trend === "up" ? "text-upwork-green" : "text-red-500"}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-upwork-lightgreen p-2">
                <stat.icon className="h-5 w-5 text-upwork-green" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
