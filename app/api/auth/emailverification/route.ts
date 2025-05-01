import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    const verificationToken = await generateVerificationToken(email);

    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      accessToken: process.env.EMAILJS_ACCESS_TOKEN,
      template_params: {
        email: email,
        link: process.env.NEXT_PUBLIC_APP_URL + "/verify?email=" + email +"&token=" + verificationToken.token
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return NextResponse.json({ message: "Verification email sent" });
    } else {
      const errorText = await response.text();

      return NextResponse.json(
        { error: "Failed to send email", details: errorText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
