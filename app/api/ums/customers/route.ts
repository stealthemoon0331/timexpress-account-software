import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import pool from "@/lib/ums/database/connector";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { use } from "react";

// This would connect to your database in a real application
// GET: Fetch all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "You are not registered." },
        { status: 400 }
      );
    }

    pool
      .getConnection()
      .then((connection) => {
        console.log("Successfully connected to the database");
        connection.release(); // Always release the connection after use
      })
      .catch((error) => {
        console.error("Error connecting to the database:", error);
      });

    console.log("user:", user);

    const [users] = await pool.query(
      `SELECT id, name, username, email, password, tenant_id, phone, mobile, fms_user_id, fms_branch,
         fms_user_role_id, wms_user_id, wms_user_role_id, crm_user_id, crm_user_role_id, tms_user_id, 
         tms_user_role_id, ams_user_id, ams_user_role_id, qcms_user_id, qcms_user_role_id,
         tsms_user_id, tsms_user_role_id, tdms_user_id, tdms_user_role_id, teams, access, selected_systems, systems_with_permission, status
         FROM customers WHERE status = 1 AND adminId = ?`,
      [user.id]
    );

    console.log("users:", users);

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "❌ Data Fetching Error", status: 500 });
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "You are not registered." },
        { status: 400 }
      );
    }

    console.log("POST : Fetching users...");

    const customerData = await request.json();
    console.log("Received data:", customerData);

    if (
      !customerData.name ||
      !customerData.email ||
      !customerData.username ||
      !customerData.password
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Check if user with same email or username already exists and is active
    const [existing] = await pool.query(
      "SELECT id FROM customers WHERE (email = ? OR username = ?) AND status = 1",
      [customerData.email, customerData.username]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    const query =
      "INSERT INTO customers (" +
      "name, email, username, password, phone, tenant_id, mobile, fms_user_id, fms_branch, " +
      "fms_user_role_id, wms_user_id, wms_user_role_id, crm_user_id, crm_user_role_id, " +
      "tms_user_id, tms_user_role_id, ams_user_id, ams_user_role_id, qcms_user_id, qcms_user_role_id, " +
      "tsms_user_id, tsms_user_role_id, tdms_user_id, tdms_user_role_id, " +
      "teams, access, selected_systems, systems_with_permission, status, adminId" +
      ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    console.log("**** customerData.tenantId *** ", customerData.tenantId);

    const values = [
      customerData.name,
      customerData.email,
      customerData.username,
      customerData.password,
      customerData.phone,
      customerData.tenantId,
      customerData.mobile,
      customerData.fms_user_id,
      JSON.stringify(customerData.fms_branch),
      customerData.fms_user_role_id || null,
      customerData.wms_user_id || null,
      customerData.wms_user_role_id || null,
      customerData.crm_user_id || null,
      customerData.crm_user_role_id || null,
      customerData.tms_user_id || null,
      customerData.tms_user_role_id,
      customerData.ams_user_id || null,
      customerData.ams_user_role_id || null,
      customerData.qcms_user_id || null,
      customerData.qcms_user_role_id || null,
      customerData.tsms_user_id || null,
      customerData.tsms_user_role_id || null,
      customerData.tdms_user_id || null,
      customerData.tdms_user_role_id || null,
      JSON.stringify(customerData.teams) || null,
      customerData.access || null,
      JSON.stringify(customerData.selected_systems) || null,
      JSON.stringify(customerData.systems_with_permission) || null,
      1,
      user.id,
    ];

    const [result] = await pool.query(query, values);
    const customerId = (result as any).insertId;

    console.log("SQL Insert Result:", result);

    return NextResponse.json(
      { ...customerData, id: customerId, status: "Active" },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const query = "UPDATE customers SET status = 0 WHERE id = ?";
    const [result] = await pool.query(query, [id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
