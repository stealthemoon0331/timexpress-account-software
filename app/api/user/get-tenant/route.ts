import { FMS_API_PATH } from "@/app/config/setting";
import pool from "@/lib/ums/database/connector";
import { getRoleName } from "@/lib/ums/utils";
import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import { system } from "@/lib/ums/type";
import prisma from "@/lib/prisma";

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
  adminId: number;
}

const allowedOrigins = [
  "http://localhost:5000",
  "https://wmsninja.com",
  "https://fleetp.com",
  "https://shypri.com",
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin");
  const isAllowedOrigin = origin && allowedOrigins.includes(origin || "");

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0], // Default to the first allowed origin if not matched
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
};

export async function OPTIONS(req: Request) {
  const corsHeaders = getCorsHeaders(req);

  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  let connection: PoolConnection | null = null;
  
  const corsHeaders = getCorsHeaders(req);

  try {
    // Validate request URL
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers: corsHeaders }
      );
    }


    // Test database connection
    try {
      connection = await pool.getConnection();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503, headers: corsHeaders }
      );
    }

    // Query customer data
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
      return NextResponse.json(
        { error: "Failed to fetch customer data" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Check if customer exists
    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Customer not found or inactive" },
        { status: 404, headers: corsHeaders }
      );
    }

    const customer = result[0];
    const adminId = customer.adminId;

    // Validate adminId
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID not found for customer" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Query admin data
    let admin;
    try {
      admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          name: true,
          planId: true,
          planExpiresAt: true,
          tenantId: true,
        },
      });
    } catch (prismaError) {
      console.error("Prisma query error:", prismaError);
      return NextResponse.json(
        { error: "Failed to fetch admin data" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Check if admin exists
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Build role information with error handling
    const buildRoleInfo = (system: system, roleId: number | string) => {
      try {
        if (roleId) {
          const roleName = getRoleName(system, roleId);
          return {
            role_id: roleId,
            role_name: roleName,
          };
        }
        return "not assigned";
      } catch (roleError) {
        console.error(`Error getting role name for ${system}:`, roleError);
        return {
          role_id: roleId,
          role_name: "unknown",
        };
      }
    };

    // Construct response data
    const responseData = {
      tenant_id: customer.tenant_id,
      tenant_name: admin.name,
      subscription_status: admin.planId,
      subscription_expiry: admin.planExpiresAt,
      tenant_role: {
        FMS: buildRoleInfo("FMS", customer.fms_user_role_id),
        WMS: buildRoleInfo("WMS", customer.wms_user_role_id),
        CRM: buildRoleInfo("CRM", customer.crm_user_role_id),
        TMS: buildRoleInfo("TMS", customer.tms_user_role_id),
        AMS: buildRoleInfo("AMS", customer.ams_user_role_id),
        QCMS: buildRoleInfo("TMS", customer.tms_user_role_id),
        TSMS: buildRoleInfo("TMS", customer.tms_user_role_id),
        HR: buildRoleInfo("TMS", customer.tms_user_role_id),
        TDMS: buildRoleInfo("TMS", customer.tms_user_role_id),
        CHATESS: buildRoleInfo("TMS", customer.tms_user_role_id),
      },
    };

    return NextResponse.json({ result: responseData }, { status: 200 });
  } catch (error) {
    console.error("Unexpected server error:", error);

    // Handle specific error types
    if (error instanceof TypeError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request syntax" },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    // Always release the connection
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing database connection:", releaseError);
      }
    }
  }
}
