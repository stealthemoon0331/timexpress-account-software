import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, email, adminEmail, availableSystems } = body;

    // Basic field validation
    if (!email || !password || !adminEmail || !availableSystems) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID_TWO,
      template_id: process.env.EMAILJS_SEND_CREDENTIAL_TEMPLATE_TWO,
      user_id: process.env.EMAILJS_USER_ID_TWO,
      accessToken: process.env.EMAILJS_ACCESS_TOKEN_TWO,
      template_params: {
        email,
        password,
        adminEmail,
        availableSystems,
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ EmailJS send failed:", errorText);
      return NextResponse.json({ error: "Email sending failed." }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: "Email sent successfully." });
  } catch (err) {
    console.error("❌ Server error in /api/email/send:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
