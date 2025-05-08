import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Handle POST request
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const body = await req.json();
  const { password } = body;

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password reset successfully." }, { status: 200 });
  } catch (err) {
    console.error("Error resetting password:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
