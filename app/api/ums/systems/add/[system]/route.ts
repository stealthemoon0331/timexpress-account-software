import {
  registerUserToAMS,
  registerUserToCRM,
  registerUserToFMS,
  registerUserToQCMS,
  registerUserToTMS,
  registerUserToWMS,
} from "@/lib/ums/systemHandlers/add/handler";
import { system } from "@/lib/ums/type";
import { getRoleId } from "@/lib/ums/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: { system: string } }
) {
  const { ssoUser, systemRoleSelections, accessToken, selectedAccess } =
    await req.json();
  const { system } = await context.params;
  console.log(
    "🚀 ~ file: route.ts:16 ~ POST ~ systemRoleSelections[system]: ",
    systemRoleSelections[system]
  );
  const roleId = getRoleId(systemRoleSelections[system], system as system);
  console.log("🚀 ~ file: route.ts:16 ~ POST ~ roleId: ", roleId);
  try {
    switch (system) {
      case "FMS":
        const fmsResponse = await registerUserToFMS({
          ssoUser,
          roleId,
          accessToken,
          system,
        });
        return NextResponse.json({
          error: fmsResponse.isError,
          message: fmsResponse.message,
          data: { system: system, userid: fmsResponse.data?.userid },
        });
      case "CRM":
        const crmResponse = await registerUserToCRM({
          ssoUser,
          roleId,
          system,
        });
        return NextResponse.json({
          error: crmResponse.isError,
          message: crmResponse.message,
          data: {
            system: system,
            userid: crmResponse.data?.userId,
            salespersonid: crmResponse.data?.salespersonId,
          },
        });
      case "WMS":
        const wmsResponse = await registerUserToWMS({
          ssoUser,
          roleId,
          system,
        });
        return NextResponse.json({
          error: wmsResponse.isError,
          message: wmsResponse.message,
          data: { system: system, userid: wmsResponse.data?.id },
        });
      case "TMS":
        const tmsResponse = await registerUserToTMS({
          ssoUser,
          roleId,
          selectedAccess,
          accessToken,
          system,
        });
        console.log("tmsResponse ==> ", tmsResponse);
        return NextResponse.json({
          error: tmsResponse.isError,
          message: tmsResponse.message,
          data: { system: system, userid: tmsResponse.data?.personnel_id },
        });
      case "AMS":
        const amsResponse = await registerUserToAMS({
          ssoUser,
          roleId,
          system,
        });

        console.log("amsResponse => ", amsResponse);

        return NextResponse.json({
          error: amsResponse.isError,
          message: amsResponse.message,
          data: { system: system, userid: amsResponse.data?.id },
        });
      
      case "QCMS":
        const qcmsResponse = await registerUserToQCMS({
          ssoUser,
          roleId,
          system,
        });

        console.log("qcmsResponse => ", qcmsResponse);

        return NextResponse.json({
          error: qcmsResponse.isError,
          message: qcmsResponse.message,
          data: { system: system, userid: qcmsResponse.data?.id },
        });

      default:
        return NextResponse.json({ error: "Invalid system" }, { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
