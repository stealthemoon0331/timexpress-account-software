import { consoleLog } from "@/lib/utils";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { SMTPHOST, SMTPPORT, SMTPUSER, SMTPPASS } from "@/app/config/setting";

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

    const transporter = nodemailer.createTransport({
      host: SMTPHOST,
      port: SMTPPORT,
      secure: true, // usually true for 465, false for 587
      auth: {
        user: SMTPUSER,
        pass: SMTPPASS,
      },
    } as nodemailer.TransportOptions);

    const mailOptions = {
      from: "noreply@shiper.io",
      to: process.env.COMPANY_CONTACT_EMAIL_TWO,
      subject: "New Contact Form Submission",
      html: `
      <div style="text-align: center; background-color: #333; padding: 14px">
      <a style="text-decoration: none; outline: none" href="[Website Link]" target="_blank">
        <img
          style="height: 32px; vertical-align: middle"
          height="32px"
          src="cid:logo.png"
          alt="logo"
        />
      </a>
    </div>
        <h2>Contact Form Submission</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Company Size:</strong> ${companySize}</p>
        <p><strong>Interest:</strong> ${interest}</p>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: "./public/logo.png",
          cid: "logo.png",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
