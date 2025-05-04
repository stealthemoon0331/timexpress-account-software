import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(req: NextRequest) {
  try {
    const planData = await req.json()

    if (!planData?.id || !planData?.name || !planData?.price || !Array.isArray(planData.features)) {
      return NextResponse.json({ message: "Invalid plan data" }, { status: 400 })
    }

    // Ensure price is a number (Float)
    const price = parseFloat(planData.price)

    if (isNaN(price)) {
      return NextResponse.json({ message: "Invalid price value" }, { status: 400 })
    }

    // Update the plan in the database
    const updatedPlan = await prisma.plan.update({
      where: { id: planData.id },
      data: {
        name: planData.name,
        description: planData.description,
        features: planData.features,
        price: price,  // Ensure price is passed here
      },
    })

    return NextResponse.json(updatedPlan)
  } catch (err: any) {
    console.error("Error updating plan:", err)
    return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 })
  }
}
