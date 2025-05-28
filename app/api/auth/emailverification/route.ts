import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { SMTPHOST, SMTPPASS, SMTPPORT, SMTPUSER } from "@/app/config/setting";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("* email : ", email);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("* user : ", user);

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

    console.log("before calling transporter : ");

    const transporter = nodemailer.createTransport({
      host: SMTPHOST,
      port: SMTPPORT,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: SMTPUSER,
        pass: SMTPPASS,
      },
    } as nodemailer.TransportOptions);

    console.log("transporter => ", transporter);

    const mailOptions = {
      from: "noreply@shiper.io", // Verified sender email address
      to: email, // Recipient email address
      subject: "Email Verification",
      html: `<div style="max-width: 600px; margin: auto; background-color: #fff">
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
    <div style="padding: 14px">
      <h1 style="font-size: 22px; margin-bottom: 26px">Confirm your email address</h1>
      <p>
        We received a request to create an account with this email address. To complete your registration, please verify your email by clicking the link below:
      </p>
      <p>
        ${
          process.env.NEXT_PUBLIC_APP_URL +
          "/verify?email=" +
          email +
          "&token=" +
          verificationToken.token
        }
      </p>
      <p>
        This link will expire in one hour.
        If you did not request this, you can safely ignore this message — no further action is required.
      </p>
      <p>Best regards,<br /></p>
      <p>Timexpress Team<br /></p>
    </div>
</div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error("Error sending email:", error);
      }
      console.log("Email sent:", info.messageId);
      console.log("Preview URL:", info);
    });

    return NextResponse.json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
