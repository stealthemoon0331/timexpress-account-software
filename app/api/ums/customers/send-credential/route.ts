import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { SMTPHOST, SMTPPORT, SMTPUSER, SMTPPASS } from "@/app/config/setting";

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

    const transporter = nodemailer.createTransport({
      host: SMTPHOST,
      port: SMTPPORT,
      secure: true, // true if using port 465
      auth: {
        user: SMTPUSER,
        pass: SMTPPASS,
      },
    } as nodemailer.TransportOptions);

    const mailOptions = {
      from: "noreply@shiper.io",
      to: email,
      subject: "Your Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
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
          <h2>Welcome to Shiper!</h2>
          <p>Your account has been created. Below are your credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> ${password}</li>
            <li><strong>Admin Email:</strong> ${adminEmail}</li>
            <li><strong>Available Systems:</strong> ${availableSystems}</li>
          </ul>
          <p>Please change your password after logging in for the first time.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <br/>
          <p>– Shiper Team</p>
        </div>
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

    return NextResponse.json({ success: true, message: "Email sent successfully." });
  } catch (err) {
    console.error("❌ Server error in /api/email/send:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
