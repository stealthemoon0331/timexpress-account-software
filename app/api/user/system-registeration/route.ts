import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("✅ * email check: ", email);

    const existingUser = await prisma.user.findUnique({ where: { email }});

    if(existingUser) {
        if(existingUser.emailVerified) {
            console.log("✅ * existing user : ", existingUser);
        }
    }

    return NextResponse.json({success: "Successufly registered in systems"}, {status: 200});
  } catch (error) {
    console.error(error);

    return NextResponse.json({error: "Server Error: Registeration failed"}, { status: 500} )
  }
}
