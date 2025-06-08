import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      image: true,
      planId: true,
      tenantId: true,
      planActivatedAt: true,
      planExpiresAt: true,
      cardBrand: true,
      cardLast4: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  try {
    const { id, name, email } = await req.json();

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Interval Server Error" },
      { status: 500 }
    );
  }
}
