"use client"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

export default function RecentActivity() {
  // Mock data - in a real app, this would come from an API
  const activities = [
    {
      id: 1,
      user: "John Doe",
      action: "Created a new organization",
      entity: "Acme Inc",
      entityType: "organization",
      timestamp: "2 minutes ago",
      icon: Icons.users,
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Updated subscription plan",
      entity: "Monthly → Annual",
      entityType: "subscription",
      timestamp: "1 hour ago",
      icon: Icons.creditCard,
    },
    {
      id: 3,
      user: "Bob Johnson",
      action: "Added new user",
      entity: "alice@example.com",
      entityType: "user",
      timestamp: "3 hours ago",
      icon: Icons.userPlus,
    },
    {
      id: 4,
      user: "Alice Williams",
      action: "Generated invoice",
      entity: "INV-2023-0042",
      entityType: "invoice",
      timestamp: "Yesterday",
      icon: Icons.page,
    },
    {
      id: 5,
      user: "Charlie Brown",
      action: "Accessed product",
      entity: "WMS Ninja Inventory",
      entityType: "product",
      timestamp: "Yesterday",
      icon: Icons.package,
    },
  ]

  const getEntityBadge = (entityType: string) => {
    switch (entityType) {
      case "organization":
        return <Badge className="bg-blue-500">Organization</Badge>
      case "subscription":
        return <Badge className="bg-upwork-green">Subscription</Badge>
      case "user":
        return <Badge className="bg-purple-500">User</Badge>
      case "invoice":
        return <Badge className="bg-amber-500">Invoice</Badge>
      case "product":
        return <Badge className="bg-indigo-500">Product</Badge>
      default:
        return <Badge>Other</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
          <div className="rounded-full bg-muted p-2">
            <activity.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{activity.user}</p>
              {getEntityBadge(activity.entityType)}
            </div>
            <p>
              {activity.action}: <span className="font-medium">{activity.entity}</span>
            </p>
            <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
