import { TMS_API_PATH } from "@/app/config/setting";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(`${TMS_API_PATH}/shypvdriverapp/team/getTeams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
