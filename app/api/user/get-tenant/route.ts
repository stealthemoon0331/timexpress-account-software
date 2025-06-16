import { FMS_API_PATH } from "@/app/config/setting";
import pool from "@/lib/ums/database/connector";
import { getRoleName } from "@/lib/ums/utils";
import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
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
  teams: string;
  access: string;
  selected_systems: string;
  systems_with_permission: string;
  status: number;
  adminId: number;
}

export async function GET(req: Request) {
  let connection: PoolConnection | null = null;

  try {
    // Validate request URL
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log("Processing request for email: ", email);

    // Test database connection
    try {
      connection = await pool.getConnection();
      console.log("✅ Successfully connected to the database");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    // Query customer data
    let result: CustomerResult[];
    try {
      const queryResult = await pool.query(
        `SELECT id, name, username, email, password, tenant_id, phone, mobile, fms_user_id, fms_branch,
   fms_user_role_id, wms_user_id, wms_user_role_id, crm_user_id, crm_user_role_id, tms_user_id,
   tms_user_role_id, teams, access, selected_systems, systems_with_permission, status, adminId
   FROM customers WHERE email = ? AND status = 1 LIMIT 1`,
        [email]
      );

      result = queryResult[0] as CustomerResult[];
    } catch (queryError) {
      console.error("Database query error:", queryError);
      return NextResponse.json(
        { error: "Failed to fetch customer data" },
        { status: 500 }
      );
    }

    // Check if customer exists
    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Customer not found or inactive" },
        { status: 404 }
      );
    }

    const customer = result[0];
    const adminId = customer.adminId;

    // Validate adminId
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID not found for customer" },
        { status: 404 }
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
        { status: 500 }
      );
    }

    // Check if admin exists
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Build role information with error handling
    const buildRoleInfo = (system: system, roleId: number) => {
      try {
        if (roleId > 0) {
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
      },
    };

    return NextResponse.json({ result: responseData }, { status: 200 });
  } catch (error) {
    console.error("Unexpected server error:", error);

    // Handle specific error types
    if (error instanceof TypeError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request syntax" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // Always release the connection
    if (connection) {
      try {
        connection.release();
        console.log("Database connection released");
      } catch (releaseError) {
        console.error("Error releasing database connection:", releaseError);
      }
    }
  }
}
