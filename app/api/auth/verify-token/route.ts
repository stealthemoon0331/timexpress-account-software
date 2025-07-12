import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { token, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const tokenRecord = await prisma.verificationtoken.findFirst({
      where: { identifier: email },
      orderBy: {
        expires: "desc",
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const now = new Date();

    if (tokenRecord.token !== token) {
      return NextResponse.json({ error: "Token is invalid" }, { status: 400 });
    }

    if (tokenRecord.expires < now) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: {
          emailVerified: new Date(),
        },
      });
    }
    
    return NextResponse.json({ token: tokenRecord.token }, { status: 200 });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
