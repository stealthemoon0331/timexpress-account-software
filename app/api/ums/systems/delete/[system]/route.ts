// app/api/systems/delete/[system]/route.ts
import { deleteUserFromCRM, deleteUserFromFMS, deleteUserFromTMS, deleteUserFromWMS } from "@/lib/ums/systemHandlers/delete/handler";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(
  req: NextRequest,
  context: { params: { system: string } }
) {
  const { user, accessToken } = await req.json();
  const { system } = await context.params;
  console.log("params system", system);
  try {
    let result;
    switch (system.toUpperCase()) {
      case "FMS":
        result = await deleteUserFromFMS({user, accessToken});
        break;
      case "WMS":
        result = await deleteUserFromWMS({user, accessToken});
        break;
      case "CRM":
        result = await deleteUserFromCRM({user, accessToken});
        break;
      case "TMS":
        result = await deleteUserFromTMS({user, accessToken});
        break;
      default:
        return NextResponse.json(
          { error: "Invalid system specified" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[DELETE_ERROR] ${system}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}