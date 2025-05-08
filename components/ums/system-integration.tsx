"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import InputWrapper from "./input-wrapper"

interface SystemConfig {
  id: string
  name: string
  apiEndpoint: string
  active: boolean
}

export default function SystemIntegration() {
  const [systems, setSystems] = useState<SystemConfig[]>([
    {
      id: "1",
      name: "CRM",
      apiEndpoint: "https://crm-api.example.com",
      active: true,
    },
    {
      id: "2",
      name: "WMS",
      apiEndpoint: "https://wms-api.example.com",
      active: true,
    },
    {
      id: "3",
      name: "FMS",
      apiEndpoint: "https://fms-api.example.com",
      active: true,
    },
  ])

  const handleToggleSystem = (id: string) => {
    setSystems(systems.map((system) => (system.id === id ? { ...system, active: !system.active } : system)))
  }

  const handleEndpointChange = (id: string, endpoint: string) => {
    setSystems(systems.map((system) => (system.id === id ? { ...system, apiEndpoint: endpoint } : system)))
  }

  const handleSaveConfig = () => {
    // In a real application, this would save the configuration to your backend
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Integration</h2>
        <Button onClick={handleSaveConfig}>Save Configuration</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {systems.map((system) => (
          <Card key={system.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{system.name}</CardTitle>
                <Switch checked={system.active} onCheckedChange={() => handleToggleSystem(system.id)} />
              </div>
              <CardDescription>{system.active ? "Connected and active" : "Disconnected"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${system.id}-endpoint`}>API Endpoint</Label>
                  <InputWrapper
                    id={`${system.id}-endpoint`}
                    value={system.apiEndpoint}
                    onChange={(e) => handleEndpointChange(system.id, e.target.value)}
                    disabled={!system.active}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" disabled={!system.active}>
                Test Connection
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

