import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const { id, currentPassword, password } = await req.json();

    if (!id || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: id }, // get from session or JWT
      select: { password: true },
    });

    if(!user || !user.password) {
      throw new Error("User not found or password not set");
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if(!isValid) {
      return NextResponse.json(
        {error: "Current password is not incorrect"},
        {status: 401}
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {

    console.error("Password update error : ", error)
    return NextResponse.json( 
      { error: error.message || "Interval Server Error" },
      { status: 500 }
    );
  }
}
