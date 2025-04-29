import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function UsagePage() {
  const products = [
    {
      name: "Shypri CRM",
      usage: 35,
      limit: 100,
      description: "Customer relationship management",
    },
    {
      name: "Fleetp Fleet Mgt",
      usage: 42,
      limit: 100,
      description: "Fleet management system",
    },
    {
      name: "WMS Ninja Inventory",
      usage: 68,
      limit: 100,
      description: "Warehouse management system",
    },
    {
      name: "Shypry B2C E-Commerce",
      usage: 12,
      limit: 100,
      description: "E-commerce platform",
    },
    {
      name: "ShypRTO Reverse Logistics",
      usage: 5,
      limit: 100,
      description: "Return management system",
    },
    {
      name: "Transport Management Software",
      usage: 27,
      limit: 100,
      description: "Transport management system",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
        <p className="text-muted-foreground">Monitor your usage across all Shiper.io products.</p>
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.name}>
            <CardHeader className="pb-2">
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Usage</span>
                  <span className="font-medium">
                    {product.usage}% of {product.limit}%
                  </span>
                </div>
                <Progress value={product.usage} className="h-2 bg-upwork-lightgreen [&>div]:bg-upwork-green" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
