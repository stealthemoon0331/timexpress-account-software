import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SubscriptionOverview } from "@/components/dashboard/subscription-overview"

export default function OverviewPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your system.</p>
      </div>

      <DashboardStats />

      <div className="flex flex-col justify-center">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>Current subscription status and billing</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionOverview />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
