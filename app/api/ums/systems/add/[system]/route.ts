import {
  registerUserToAMS,
  registerUserToCRM,
  registerUserToFMS,
  registerUserToQCMS,
  registerUserToTDMS,
  registerUserToTMS,
  registerUserToTSMS,
  registerUserToWMS,
  registerUserToHR,
  registerUserToUSLM,
  registerUserToCHATESS,
} from "@/lib/ums/systemHandlers/add/handler";
import { system } from "@/lib/ums/type";
import { getRoleId } from "@/lib/ums/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: { system: string } }
) {
  const { ssoUser, systemRoleSelections, accessToken, selectedAccess } = await req.json();
  const { system } = await context.params;
  
  const roleId = getRoleId(systemRoleSelections[system], system as system);

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

        return NextResponse.json({
          error: qcmsResponse.isError,
          message: qcmsResponse.message,
          data: { system: system, userid: qcmsResponse.data?.id },
        });
      
      case "TSMS":
        const tsmsResponse = await registerUserToTSMS({
          ssoUser,
          roleId,
          system,
        });

        return NextResponse.json({
          error: tsmsResponse.isError,
          message: tsmsResponse.message,
          data: { system: system, userid: tsmsResponse.data?.id },
        });
      
      case "TDMS":
        const tdmsResponse = await registerUserToTDMS({
          ssoUser,
          roleId,
          system,
        });

        return NextResponse.json({
          error: tdmsResponse.isError,
          message: tdmsResponse.message,
          data: { system: system, userid: tdmsResponse.data?.id },
        });

      case "HR":
        const hrResponse = await registerUserToHR({
          ssoUser,
          roleId,
          system,
        });

        return NextResponse.json({
          error: hrResponse.isError,
          message: hrResponse.message,
          data: { system: system, userid: hrResponse.data?.id },
        });
        case "USLM":
  //       try{
  //       const uslmResponse = await registerUserToUSLM({
  //         ssoUser,
  //         roleId,
  //         system,
  //       });
  //       console.log("USLM registration: ", ssoUser, roleId, system);
  //       return NextResponse.json({
  //         error: uslmResponse.isError,
  //         message: uslmResponse.message,
  //         data: { system: system, userid: uslmResponse.data?.id },
  //       });
  //     }catch (err) {
  //   console.error("USLM registration failed:", err);
  //   return NextResponse.json(
  //     {
  //       error: true,
  //       message: "USLM registration failed",
  //       data: { system: system },
  //     },
  //     { status: 500 }
  //   );
  // }
  case "USLM":
  try {
    const uslmResponse = await registerUserToUSLM({
      ssoUser,
      roleId,
      system,
    });

    console.log("USLM registration: ", ssoUser, roleId, system);
    console.log("USLM registration response:", uslmResponse);

    return NextResponse.json({
      error: uslmResponse.isError,
      message: uslmResponse.message,
      data: {
        system,
        userid: uslmResponse?.data?.id || null,
      },
    });
  } catch (err: any) {
    console.error("USLM registration failed:", err);
    
    // Optional: Log more if it's a FetchError or contains a response
    if (err?.response) {
      try {
        const errorBody = await err.response.text();
        console.error("USLM error response body:", errorBody);
      } catch (parseErr) {
        console.error("Error reading response body:", parseErr);
      }
    }

    return NextResponse.json(
      {
        error: true,
        message: "USLM registration failed",
        data: { system },
      },
      { status: 500 }
    );
  }

      
      case "CHATESS":
        const chatessResponse = await registerUserToCHATESS({
          ssoUser,
          roleId,
          system,
        });

        return NextResponse.json({
          error: chatessResponse.isError,
          message: chatessResponse.message,
          data: { system: system, userid: chatessResponse.data?.id },
        });

      default:
        return NextResponse.json({ error: "Invalid system" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
