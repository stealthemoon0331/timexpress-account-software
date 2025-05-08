import pool from "@/lib/ums/database/connector";
import { NextResponse } from "next/server";

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const adminData = await request.json();
    // const { id } = await context.params; // ✅ Fix: No need for `await`
    
    if (!adminData.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE admin 
      SET name = ?, username = ?, email = ?, password = ?
      WHERE id = ?
    `; 
    
    const values = [
        adminData.name,
        adminData.username,
        adminData.email,
        adminData.password,
        adminData.id, 
    ];


    const [result] = await pool.query(query, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully", user: values}, {status: 200});
  } catch (error: any) {
    console.error("Error updating user:", error); // ✅ Improved logging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
