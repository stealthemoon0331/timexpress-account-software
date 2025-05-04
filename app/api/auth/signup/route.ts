import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      plan: { connect: { id: "free-trial" } },
      planActivatedAt: new Date(),
      planExpiresAt: new Date(Date.now() + Number(process.env.TRIAL_DURATION)* 24 * 60 * 60 * 1000), 
    },
  });

  return NextResponse.json(user);
}
