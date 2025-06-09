import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  const { email, password } = await req.json();

//   const validEmail = "test@example.com";
//   const validPassword = "password123";

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin || !(password === admin?.password)) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  if (email === admin.email && password === admin.password) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600, // 1 hour
    });

    return response;
  }

  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}
