import pool from "@/lib/ums/database/connector";
import { NextResponse } from "next/server";
import { use } from "react";
// PUT: Update an existing user
export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { systems_with_permission } = await request.json();

    const { id } = await context.params; 
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE customers 
      SET systems_with_permission = ?
      WHERE id = ?
    `; 
    
    const values = [
      JSON.stringify(systems_with_permission),
      id, 
    ];

    const [result] = await pool.query(query, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated Permission successfully" });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


  