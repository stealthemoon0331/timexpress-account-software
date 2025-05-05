import pool from "@/lib/ums/database/connector";
import { NextResponse } from "next/server";
import { use } from "react";

// This would connect to your database in a real application
// GET: Fetch all users
export async function GET() {
  try {

    pool
      .getConnection()
      .then((connection) => {
        console.log("Successfully connected to the database");
        connection.release(); // Always release the connection after use
      })
      .catch((error) => {
        console.error("Error connecting to the database:", error);
      });

    const [users] = await pool.query(
      "SELECT id, name, username, email, password, phone, mobile, fms_user_id, fms_branch, " +
        "fms_user_role_id, wms_user_id, wms_user_role_id, crm_user_id, crm_user_role_id, tms_user_id, tms_user_role_id, teams, access, selected_systems, systems_with_permission, status" +
        " FROM customers WHERE status = 1"
    );
    console.log("Fetched users:", users);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "❌ Data Fetching Error", status: 500 });
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    console.log("POST : Fetching users...");

    const userData = await request.json();
    console.log("Received data:", userData);

    if (
      !userData.name ||
      !userData.email ||
      !userData.username ||
      !userData.password
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Check if user with same email or username already exists and is active
    const [existing] = await pool.query(
      "SELECT id FROM customers WHERE (email = ? OR username = ?) AND status = 1",
      [userData.email, userData.username]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    const query =
      "INSERT INTO customers (" +
      "name, email, username, password, phone, mobile, fms_user_id, fms_branch, " +
      "fms_user_role_id, wms_user_id, wms_user_role_id, crm_user_id, crm_user_role_id, tms_user_id, tms_user_role_id, teams, access, selected_systems, systems_with_permission, status" +
      ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [
      userData.name,
      userData.email,
      userData.username,
      userData.password,
      userData.phone,
      userData.mobile,
      userData.fms_user_id,
      JSON.stringify(userData.fms_branch),
      userData.fms_user_role_id,
      userData.wms_user_id,
      userData.wms_user_role_id,
      userData.crm_user_id,
      userData.crm_user_role_id,
      userData.tms_user_id,
      userData.tms_user_role_id,
      JSON.stringify(userData.teams),
      userData.access,
      JSON.stringify(userData.selected_systems),
      JSON.stringify(userData.systems_with_permission),
      1 // 👈 Set status to active
    ];

    const [result] = await pool.query(query, values);
    const userId = (result as any).insertId;

    console.log("SQL Insert Result:", result);

    return NextResponse.json(
      { ...userData, id: userId, status: "Active" },
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
