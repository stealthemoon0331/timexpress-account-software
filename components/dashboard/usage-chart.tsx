"use client"

import { useState } from "react"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

// Chart options
const chartOptions: ChartOptions<"bar" | "line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

// Mock data for the charts
const mockProductData = {
  labels: ["Shypri CRM", "Fleetp Fleet Mgt", "WMS Ninja", "Shypry B2C", "ShypRTO", "TMS"],
  datasets: [
    {
      label: "Usage (%)",
      data: [65, 42, 73, 28, 15, 47],
      backgroundColor: [
        "rgba(20, 168, 0, 0.6)", // Upwork green with opacity
        "rgba(20, 168, 0, 0.6)",
        "rgba(20, 168, 0, 0.6)",
        "rgba(20, 168, 0, 0.6)",
        "rgba(20, 168, 0, 0.6)",
        "rgba(20, 168, 0, 0.6)",
      ],
      borderColor: [
        "rgba(16, 138, 0, 1)", // Darker Upwork green
        "rgba(16, 138, 0, 1)",
        "rgba(16, 138, 0, 1)",
        "rgba(16, 138, 0, 1)",
        "rgba(16, 138, 0, 1)",
        "rgba(16, 138, 0, 1)",
      ],
      borderWidth: 1,
    },
  ],
}

const mockTimeData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Shypri CRM",
      data: [20, 35, 45, 65],
      borderColor: "rgba(20, 168, 0, 1)",
      backgroundColor: "rgba(20, 168, 0, 0.1)",
      tension: 0.4,
    },
    {
      label: "Fleetp Fleet Mgt",
      data: [15, 25, 35, 42],
      borderColor: "rgba(245, 158, 11, 1)",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      tension: 0.4,
    },
    {
      label: "WMS Ninja",
      data: [30, 45, 60, 73],
      borderColor: "rgba(16, 185, 129, 1)",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.4,
    },
  ],
}

export function UsageChart() {
  const [timeRange, setTimeRange] = useState("month")

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Usage Overview</h3>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="quarter">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="products">By Product</TabsTrigger>
              <TabsTrigger value="time">Over Time</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="h-[300px]">
              <Bar options={chartOptions} data={mockProductData} />
            </TabsContent>
            <TabsContent value="time" className="h-[300px]">
              <Line options={chartOptions} data={mockTimeData} />
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col items-center p-3 bg-upwork-lightgreen rounded-md">
              <span className="text-sm text-upwork-gray">Most Used</span>
              <span className="font-medium text-upwork-green">WMS Ninja</span>
              <span className="text-xs text-upwork-gray">73% of limit</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-upwork-lightgreen rounded-md">
              <span className="text-sm text-upwork-gray">Total Usage</span>
              <span className="font-medium text-upwork-green">45%</span>
              <span className="text-xs text-upwork-gray">Across all products</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-upwork-lightgreen rounded-md">
              <span className="text-sm text-upwork-gray">Growth</span>
              <span className="font-medium text-upwork-green">+18%</span>
              <span className="text-xs text-upwork-gray">From last week</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
