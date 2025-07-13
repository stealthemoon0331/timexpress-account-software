import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import nodemailer from "nodemailer";
import { SMTPHOST, SMTPPORT, SMTPUSER, SMTPPASS } from "@/app/config/setting";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // To avoid exposing whether the email exists
    return NextResponse.json({ success: true });
  }

  const token = uuidv4();
  const expires = addMinutes(new Date(), 15);

  await prisma.verificationtoken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: SMTPHOST,
    port: SMTPPORT,
    secure: true,
    auth: {
      user: SMTPUSER,
      pass: SMTPPASS,
    },
  } as nodemailer.TransportOptions);

  const mailOptions = {
    from: "noreply@shiper.io",
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You recently requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #333; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>This link will expire in 15 minutes.</p>
        <br/>
        <p>– Timexpress Team</p>
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

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending reset email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
