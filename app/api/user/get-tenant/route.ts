import pool from "@/lib/ums/database/connector";
import { getRoleName } from "@/lib/ums/utils";
import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import prisma from "@/lib/prisma";
import { system } from "@/lib/ums/type";

interface CustomerResult {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  tenant_id: string;
  phone: string;
  mobile: string;
  fms_user_id: number;
  fms_branch: string;
  fms_user_role_id: number;
  wms_user_id: number;
  wms_user_role_id: number;
  crm_user_id: number;
  crm_user_role_id: number;
  tms_user_id: number;
  tms_user_role_id: number;
  ams_user_id: number;
  ams_user_role_id: string;
  hr_user_id: number;
  hr_user_role_id: string;
  qcms_user_id: number;
  qcms_user_role_id: string;
  tsms_user_id: number;
  tsms_user_role_id: string;
  tdms_user_id: number;
  tdms_user_role_id: string;
  chatess_user_id: number;
  chatess_user_role_id: string;
  teams: string;
  access: string;
  selected_systems: string;
  systems_with_permission: string;
  status: number;
  adminId: string;
}

// Allow all origins (wildcard)
const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
});

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

export async function GET(req: Request) {
  let connection: PoolConnection | null = null;
  const corsHeaders = getCorsHeaders();

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400, headers: corsHeaders });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400, headers: corsHeaders });
    }

    try {
      connection = await pool.getConnection();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json({ error: "Database connection failed" }, { status: 503, headers: corsHeaders });
    }

    let result: CustomerResult[];
    try {
      const queryResult = await pool.query(
        `SELECT id, name, username, email, password, tenant_id, phone, mobile, fms_user_id, fms_branch,
         fms_user_role_id, wms_user_id, wms_user_role_id, crm_user_id, crm_user_role_id, tms_user_id,
         tms_user_role_id, ams_user_id, ams_user_role_id, qcms_user_id, qcms_user_role_id, tsms_user_id, tsms_user_role_id, 
         tdms_user_id, tdms_user_role_id, hr_user_id, hr_user_role_id, chatess_user_id, chatess_user_role_id,
         teams, access, selected_systems, systems_with_permission, status, adminId
         FROM customers WHERE email = ? AND status = 1 LIMIT 1`,
        [email]
      );
      result = queryResult[0] as CustomerResult[];
    } catch (queryError) {
      console.error("Database query error:", queryError);
      return NextResponse.json({ error: "Failed to fetch customer data" }, { status: 500, headers: corsHeaders });
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Customer not found or inactive" }, { status: 404, headers: corsHeaders });
    }

    const customer = result[0];

    if (!customer.adminId) {
      return NextResponse.json({ error: "Admin ID not found for customer" }, { status: 404, headers: corsHeaders });
    }

    let admin;
    try {
      admin = await prisma.user.findUnique({
        where: { id: customer.adminId },
        select: {
          id: true,
          name: true,
          planId: true,
          planExpiresAt: true,
          tenantId: true,
          planExpired: true,
        },
      });
    } catch (prismaError) {
      console.error("Prisma query error:", prismaError);
      return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500, headers: corsHeaders });
    }

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404, headers: corsHeaders });
    }

    const buildRoleInfo = (system: system, roleId: number | string) => {
      try {
        if (roleId) {
          return {
            role_id: roleId,
            role_name: getRoleName(system, roleId),
          };
        }
        return "not assigned";
      } catch (err) {
        console.error(`Failed to get role name for ${system}:`, err);
        return {
          role_id: roleId,
          role_name: "unknown",
        };
      }
    };

    const responseData = {
      tenant_id: customer.tenant_id,
      tenant_name: admin.name,
      subscription_status: admin.planId,
      subscription_expiry: admin.planExpiresAt,
      subscription_expired: admin.planExpired === 1 ? true : false,
      tenant_role: {
        FMS: buildRoleInfo("FMS", customer.fms_user_role_id),
        WMS: buildRoleInfo("WMS", customer.wms_user_role_id),
        CRM: buildRoleInfo("CRM", customer.crm_user_role_id),
        TMS: buildRoleInfo("TMS", customer.tms_user_role_id),
        AMS: buildRoleInfo("AMS", customer.ams_user_role_id),
        QCMS: buildRoleInfo("QCMS", customer.qcms_user_role_id),
        TSMS: buildRoleInfo("TSMS", customer.tsms_user_role_id),
        HR: buildRoleInfo("HR", customer.hr_user_role_id),
        TDMS: buildRoleInfo("TDMS", customer.tdms_user_role_id),
        CHATESS: buildRoleInfo("CHATESS", customer.chatess_user_role_id),
      },
    };

    return NextResponse.json({ result: responseData }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing DB connection:", releaseError);
      }
    }
  }
}
