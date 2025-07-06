//app/api/payment/paypal/complete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, planId, paypalSubscriptionId } = await req.json();
  await prisma.user.update({
    where: { id: userId },
    data: {
      planId,
      planActivatedAt: new Date(),
      paypalSubscriptionId,
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
  });

  return NextResponse.json({ success: true });
}
