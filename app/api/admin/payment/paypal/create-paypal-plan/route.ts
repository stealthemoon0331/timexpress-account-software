import { NextRequest, NextResponse } from "next/server"
import { getPayPalAccessToken, createPayPalProduct, createPayPalPlan } from "@/lib/paypal"
import prisma from "@/lib/prisma"
// import { authAdmin } from "@/lib/auth" // implement your admin auth logic

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check (customize as needed)
    // const isAdmin = await authAdmin(req)
    // if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const plan = await req.json()
    console.log("plan ==> ", plan)
    if (!plan?.id || !plan?.name || plan.price == null) {
      return NextResponse.json({ message: "Invalid plan data" }, { status: 400 })
    }

    const priceNumber = parseFloat(plan.price)
    const accessToken = await getPayPalAccessToken()

    // 2. Create Product
    const product = await createPayPalProduct(plan.name, accessToken)

    // 3. If price is 0, skip billing plan creation
    if (priceNumber === 0) {
        await prisma.plan.upsert({
          where: { id: plan.id },
          create: {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: 0,
            features: plan.features,
            paypalPlanId: "P-TRIAL",
          },
          update: {
            name: plan.name,
            description: plan.description,
            price: 0,
            features: plan.features,
            paypalPlanId: "P-TRIAL",
          },
        })
      
        return NextResponse.json({
          message: "Free plan created (no PayPal billing plan needed)",
          planId: null,
        })
      }
      

    // 4. Create Billing Plan
    const billingPlan = await createPayPalPlan({
      productId: product.id,
      name: plan.name,
      description: plan.description,
      price: priceNumber,
    }, accessToken)

    // 5. Store billing plan ID in DB
    await prisma.plan.upsert({
        where: { id: plan.id },
        create: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: priceNumber,
          features: plan.features,
          paypalPlanId: billingPlan?.id ?? null,
        },
        update: {
          name: plan.name,
          description: plan.description,
          price: priceNumber,
          features: plan.features,
          paypalPlanId: billingPlan?.id ?? null,
        },
      })
      

    return NextResponse.json({ planId: billingPlan.id })
  } catch (err: any) {
    console.error("Error creating PayPal plan:", err)
    return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 })
  }
}
