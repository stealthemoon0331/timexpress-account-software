import { consoleLog } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      userEmail,
      phone,
      country,
      company,
      companySize,
      interest,
    } = body;
    consoleLog("country", country);
    consoleLog("EMAILJS_SERVICE_ID_TWO", process.env.EMAILJS_SERVICE_ID_TWO)
    consoleLog("EMAILJS_ACCESS_TOKEN_TWO", process.env.EMAILJS_ACCESS_TOKEN_TWO)
    consoleLog("EMAILJS_USER_ID_TWO", process.env.EMAILJS_USER_ID_TWO)
    consoleLog("EMAILJS_CONTACT_TEMPLATE_ID_TWO", process.env.EMAILJS_CONTACT_TEMPLATE_ID_TWO);
    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID_TWO,
      template_id: process.env.EMAILJS_CONTACT_TEMPLATE_ID_TWO,
      user_id: process.env.EMAILJS_USER_ID_TWO, // Usually required unless using accessToken only
      accessToken: process.env.EMAILJS_ACCESS_TOKEN_TWO, // For private templates
      template_params: {
        fullName,
        userEmail,
        phone,
        country,
        company,
        companySize,
        interest,
        email: process.env.COMPANY_CONTACT_EMAIL_TWO
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS error response:", errorText);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
