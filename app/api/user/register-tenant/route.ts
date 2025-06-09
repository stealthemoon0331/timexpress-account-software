//api/user/register-tenant/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  
  const email = url.searchParams.get("email");

  

  if (!email) {
    return NextResponse.json({ error: "Request Error" }, { status: 400 });
  }

  try {
    console.log("✅ Tenant Check email : ", email);

    const existingTenant = await prisma.tenants.findUnique({
      where: { email },
    });

    console.log("✅ ExistingTenant =>", existingTenant);

    if (existingTenant) {
      return NextResponse.json(
        { data: existingTenant.tenantId },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ data: null }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, tenantId } = await req.json();

    console.log("✅ * id check: ", email);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.tenants.create({
        data: {
          email: email,
          tenantId: tenantId,
        },
      });

      await prisma.user.update({
        where: { email },
        data: {
          tenantId: tenantId,
        },
      });
      return NextResponse.json(
        { success: "Successufly registered in systems", tenantId: tenantId },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server Error: Registeration failed" },
      { status: 500 }
    );
  }
}
