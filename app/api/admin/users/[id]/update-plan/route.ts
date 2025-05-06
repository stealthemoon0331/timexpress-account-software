import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { planId } = await req.json();

  if (!planId) {
    return NextResponse.json({ error: "Plan ID is required." }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        planId,
        planActivatedAt: new Date(),
        // Optional: Extend expiration (e.g., 30 days from now)
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ message: "Subscription updated successfully.", user: updatedUser }, { status: 200 });
  } catch (err) {
    console.error("Error updating plan:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
