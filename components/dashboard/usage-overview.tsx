"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { ChartContainer } from "@/components/ui/chart"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function UsageOverview() {
  // Mock data - in a real app, this would come from an API
  const data = {
    labels: ["Shypri CRM", "Fleetp Fleet", "WMS Ninja", "Shypry B2C", "ShypRTO", "TMS"],
    datasets: [
      {
        label: "Usage (%)",
        data: [65, 42, 73, 28, 15, 47],
        backgroundColor: "rgba(20, 168, 0, 0.6)", // Upwork green with opacity
        borderColor: "rgba(16, 138, 0, 1)", // Darker Upwork green
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Usage (%)",
        },
      },
    },
  }

  return (
    <div className="h-[300px]">
      <ChartContainer
        config={{
          usage: {
            label: "Usage (%)",
            color: "hsl(var(--chart-1))",
          },
        }}
      >
        <Bar data={data} options={options} />
      </ChartContainer>
    </div>
  )
}
