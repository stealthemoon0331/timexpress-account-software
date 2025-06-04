import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  // If email already exists
  if (existingUser) {
    if (existingUser.emailVerified) {
      // Already verified — do not allow update
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Email not verified — update user record
    const hashedPassword = await bcrypt.hash(password, 10);

    const tenantId = nanoid();

    console.log("tenantId ==> ", tenantId);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
        tenantId: tenantId,
        plan: { connect: { id: "free-trial" } },
        planActivatedAt: new Date(),
        planExpiresAt: new Date(
          Date.now() + Number(process.env.TRIAL_DURATION) * 24 * 60 * 60 * 1000
        ),
      },
    });

    return NextResponse.json(updatedUser);
  }

  // New user — create fresh account
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      plan: { connect: { id: "free-trial" } },
      planActivatedAt: new Date(),
      planExpiresAt: new Date(
        Date.now() + Number(process.env.TRIAL_DURATION) * 24 * 60 * 60 * 1000
      ),
    },
  });

  return NextResponse.json(newUser);
}
