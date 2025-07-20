import { NextResponse } from "next/server";


export async function PUT(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        planExpired: 1
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