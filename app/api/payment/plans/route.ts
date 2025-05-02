// app/api/plans/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the path to your Prisma instance

export async function POST() {
  const plans = [
    {
      id: "free-trial",
      name: "Free Trial",
      description: "30-day free trial with all features",
      price: 0,
      features: JSON.stringify([
        "All Shiper.io products",
        "Unlimited usage during trial",
        "Email support",
        "Automatic conversion to monthly plan after trial",
      ]),
    },
    {
      id: "starter",
      name: "Starter",
      description: "30-day free trial, then $15/month",
      price: 15,
      features: JSON.stringify([
        "CRM", "Accounting", "To Do", "Planner", "Quote", "Analytics", "HR"
      ]),
    },
    {
      id: "pro-suite",
      name: "Pro Suite",
      description: "30-day free trial, then $29/month",
      price: 29,
      features: JSON.stringify([
        "CRM", "WMS", "Accounting", "To Do", "Planner", "Quote", "Analytics", "HR"
      ]),
    },
    {
      id: "elite",
      name: "Elite",
      description: "30-day free trial, then $49/month",
      price: 49,
      features: JSON.stringify([
        "CRM", "WMS", "FMS", "Accounting", "To Do", "Planner", "Quote", "Analytics", "HR"
      ]),
    },
  ];

  try {
    for (const plan of plans) {
      await prisma.plan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan,
      });
    }
    return NextResponse.json({ message: 'Plans seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Failed to seed plans' }, { status: 500 });
  }
}
