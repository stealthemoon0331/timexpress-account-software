//app/api/payment/paypal/complete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, planId, paypalSubscriptionId } = await req.json();
  console.log("userId, planId, paypalSubscriptionId", userId, " : ", planId, " : ", paypalSubscriptionId, " : ")
  await prisma.user.update({
    where: { id: userId },
    data: {
      planId,
      planActivatedAt: new Date(),
      paypalSubscriptionId,
      // You can optionally set planExpiresAt or calculate later via webhook
    },
  });

  return NextResponse.json({ success: true });
}
