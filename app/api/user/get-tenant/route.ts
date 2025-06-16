//api/user/get-tenant/route.ts

import { FMS_API_PATH } from "@/app/config/setting";
import pool from "@/lib/ums/database/connector";
import { getRoleName } from "@/lib/ums/utils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Request Error" }, { status: 400 });
  }

  try {
    console.log("email: ", email);

    pool
      .getConnection()
      .then((connection) => {
        console.log("✅ Successfully connected to the database");
        connection.release();
      })
      .catch((error) => {
        console.error("Error connecting to the database:", error);
        return NextResponse.json(
          { error: "Database Connection Error" },
          { status: 500 }
        );
      });

    const [result] = (await pool.query(
      `SELECT id, name, username, email, password, tenant_id, phone, mobile, fms_user_id, fms_branch,
         fms_user_role_id, wms_user_id, wms_user_role_id, crm_user_id, crm_user_role_id, tms_user_id, 
         tms_user_role_id, teams, access, selected_systems, systems_with_permission, status, adminId
         FROM customers WHERE email = ? AND status = 1 LIMIT 1`,
      [email]
    )) as any[];

    const adminId = result[0]?.adminId;

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        planId: true,
        planExpiresAt: true,
        tenantId: true,
      },
    });

    const responseData = {
      tenant_id: result[0]?.tenant_id,
      tenant_name: admin.name,
      subscription_status: admin.planId,
      subscription_expiry: admin.planExpiresAt,
      tenant_role: {
        FMS:
          result[0]?.fms_user_role_id > 0
            ? {
                role_id: result[0]?.fms_user_role_id,
                role_name: getRoleName("FMS", result[0]?.fms_user_role_id),
              }
            : "not assigned",
        WMS:
          result[0]?.wms_user_role_id > 0
            ? {
                role_id: result[0]?.wms_user_role_id,
                role_name: getRoleName("WMS", result[0]?.wms_user_role_id),
              }
            : "not assigned",
        CRM:
          result[0]?.crm_user_role_id > 0
            ? {
                role_id: result[0]?.crm_user_role_id,
                role_name: getRoleName("CRM", result[0]?.crm_user_role_id),
              }
            : "not assigned",
        TMS:
          result[0]?.tms_user_role_id > 0
            ? {
                role_id: result[0]?.tms_user_role_id,
                role_name: getRoleName("TMS", result[0]?.tms_user_role_id),
              }
            : "not assigned",
      },
    };

    return NextResponse.json({ result: responseData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
