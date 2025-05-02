import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, planId } = body;

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing userId or planId" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        planId,
        planActivatedAt: new Date(),
        planExpiresAt: addDays(new Date(), 30),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYMENT COMPLETE ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
