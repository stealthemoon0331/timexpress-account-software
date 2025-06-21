import {
  updateUserInAMS,
  updateUserInCRM,
  updateUserInFMS,
  updateUserInTMS,
  updateUserInWMS,
} from "@/lib/ums/systemHandlers/edit/handler";
import { system } from "@/lib/ums/type";
import { getRoleId } from "@/lib/ums/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: { system: string } }
) {
  const { system } = await context.params;
  const {
    formData,
    systemRoleSelections,
    accessToken,
    selectedTmsAccess,
    user,
  } = await req.json();

  const roleId = getRoleId(systemRoleSelections[system], system as system);

  console.log("Form Data from edit endpoint => ", formData);
  
  try {
    switch (system) {
      case "FMS":
        const fmsResponse = await updateUserInFMS({
          formData,
          roleId,
          accessToken,
          user,
          system,
        });
        return NextResponse.json(fmsResponse);

      case "WMS":
        const wmsResponse = await updateUserInWMS({
          formData,
          roleId,
          accessToken,
          user,
          system,
        });
        return NextResponse.json(wmsResponse);

      case "CRM":
        const crmResponse = await updateUserInCRM({
          formData,
          roleId,
          accessToken,
          user,
          system,
        });
        return NextResponse.json(crmResponse);

      case "TMS":
        const tmsResponse = await updateUserInTMS({
          formData,
          roleId,
          selectedAccess: selectedTmsAccess,
          user,
          system,
        });
        return NextResponse.json(tmsResponse);

      case "AMS":
        console.log("AMS formData => ", formData);
        console.log("AMS roleId => ", roleId);
        console.log("AMS user => ", user);
        console.log("AMS system => ", system);


        const amsResponse = await updateUserInAMS({
          formData,
          roleId,
          user,
          system,
        });
        return NextResponse.json(amsResponse);

      default:
        return NextResponse.json(
          { isError: true, message: "Invalid system" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { isError: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
