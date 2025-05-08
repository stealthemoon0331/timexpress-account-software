import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    const cookieStore = await cookies(); // Access cookies
    const token = cookieStore.get("adminToken")?.value;
console.log("tokentoken => ", token)
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET); // Verify the token
    return NextResponse.json({ message: "Authenticated" });
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
