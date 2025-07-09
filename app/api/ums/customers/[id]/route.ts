import pool from "@/lib/ums/database/connector";
import { NextResponse } from "next/server";
import { use } from "react";
// PUT: Update an existing user
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const userData = await request.json();

    const { id } = await context.params; // ✅ Fix: No need for `await`

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const query = `
  UPDATE customers 
  SET 
    name = ?, 
    username = ?, 
    email = ?, 
    password = ?, 
    selected_systems = ?, 
    fms_user_id = ?, 
    fms_branch = ?, 
    fms_user_role_id = ?, 
    wms_user_id = ?, 
    wms_user_role_id = ?, 
    crm_user_id = ?, 
    crm_user_role_id = ?, 
    tms_user_id = ?, 
    tms_user_role_id = ?, 
    ams_user_id = ?, 
    ams_user_role_id = ?, 
    qcms_user_id = ?, 
    qcms_user_role_id = ?, 
    tsms_user_id = ?, 
    tsms_user_role_id = ?, 
    tdms_user_id = ?, 
    tdms_user_role_id = ?, 
    hr_user_id = ?, 
    hr_user_role_id = ?, 
    chatess_user_id = ?, 
    chatess_user_role_id = ?, 
    chatess_workspace = ?, 
    access = ?, 
    teams = ?, 
    phone = ?, 
    mobile = ?, 
    systems_with_permission = ?
  WHERE id = ?
`;

    const values = [
      userData.name,
      userData.username,
      userData.email,
      userData.password,
      JSON.stringify(userData.selected_systems),
      userData.fms_user_id,
      JSON.stringify(userData.fms_branch),
      userData.fms_user_role_id,
      userData.wms_user_id,
      userData.wms_user_role_id,
      userData.crm_user_id,
      userData.crm_user_role_id,
      userData.tms_user_id,
      userData.tms_user_role_id,
      userData.ams_user_id,
      userData.ams_user_role_id,
      userData.qcms_user_id,
      userData.qcms_user_role_id,
      userData.tsms_user_id,
      userData.tsms_user_role_id,
      userData.tdms_user_id,
      userData.tdms_user_role_id,
      userData.hr_user_id,
      userData.hr_user_role_id,
      userData.chatess_user_id,
      userData.chatess_user_role_id,
      userData.chatess_workspace,
      userData.access,
      JSON.stringify(userData.teams),
      userData.phone,
      userData.mobile,
      JSON.stringify(userData.systems_with_permission),
      id,
    ];

    const [result] = await pool.query(query, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: any) {
    console.error("Error updating user:", error); // ✅ Improved logging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
