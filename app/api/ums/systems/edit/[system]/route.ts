import {
  updateUserInAMS,
  updateUserInCRM,
  updateUserInFMS,
  updateUserInQCMS,
  updateUserInTDMS,
  updateUserInTMS,
  updateUserInTSMS,
  updateUserInWMS,
  updateUserInHR,
  updateUserInUSLM,
  updateUserInCHATESS,
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
        const amsResponse = await updateUserInAMS({
          formData,
          roleId,
          user,
          system,
        });
        return NextResponse.json(amsResponse);

      case "QCMS":
        const qcmsResponse = await updateUserInQCMS({
          formData,
          roleId,
          user,
          system,
        });

        return NextResponse.json(qcmsResponse);

      case "TSMS":
        const tsmsResponse = await updateUserInTSMS({
          formData,
          roleId,
          user,
          system,
        });

        return NextResponse.json(tsmsResponse);

      case "TDMS":
        const tdmsResponse = await updateUserInTDMS({
          formData,
          roleId,
          user,
          system,
        });

        return NextResponse.json(tdmsResponse);

      
      case "HR":
        const hrResponse = await updateUserInHR({
          formData,
          roleId,
          user,
          system,
        });
        
        return NextResponse.json(hrResponse);

        case "USLM":
        const uslmResponse = await updateUserInUSLM({
          formData,
          roleId,
          user,
          system,
        });
        
        return NextResponse.json(uslmResponse);
      
      case "CHATESS":
        const chatessResponse = await updateUserInCHATESS({
          formData,
          roleId,
          user,
          system,
        });
        
        return NextResponse.json(chatessResponse);
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
