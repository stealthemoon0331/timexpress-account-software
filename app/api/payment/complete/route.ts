//api/payment/complete/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addDays, isAfter } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      planId,
      amount,
      currency = "USD",
      method = "manual",
      orderId = "",
    } = body;

    if (!userId || !planId || !amount) {
      return NextResponse.json(
        { error: "Missing userId, planId or amount" },
        { status: 400 }
      );
    }

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const isSamePlan = currentUser.planId === planId;
    const isPlanStillActive =
      currentUser.planExpiresAt && isAfter(currentUser.planExpiresAt, now);

    const newExpirationDate = isSamePlan && isPlanStillActive
      ? addDays(currentUser.planExpiresAt!, 30)
      : addDays(now, 30);

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        planId,
        planActivatedAt: now,
        planExpiresAt: newExpirationDate,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        status: "COMPLETED",
        method,
        orderId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYMENT COMPLETE ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
