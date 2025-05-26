import { NextResponse } from "next/server";
import nodemailer from "nodemailer"
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

    console.log("before calling transporter : ")

    const transporter = nodemailer.createTransport({
        host: SMTPHOST,
        port: SMTPPORT,
        secure: true, // true for port 465, false for other ports
        auth: {
            user: SMTPUSER,
            pass: SMTPPASS,
        },
    }as nodemailer.TransportOptions);

    console.log("transporter => ", transporter);
    

    // const payload = {
    //   service_id: process.env.EMAILJS_SERVICE_ID,
    //   template_id: process.env.EMAILJS_MAIL_CONFIRM_TEMPLATE_ID,
    //   user_id: process.env.EMAILJS_USER_ID,
    //   accessToken: process.env.EMAILJS_ACCESS_TOKEN,
    //   template_params: {
    //     email: email,
    //     link: process.env.NEXT_PUBLIC_APP_URL + "/verify?email=" + email +"&token=" + verificationToken.token
    //   },
    // };

    // const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });

    const mailOptions = {
        from: 'noreply@shiper.io', // Verified sender email address
        to: email, // Recipient email address
        subject: 'Email Verification',
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
      <h1 style="font-size: 22px; margin-bottom: 26px">Welcome to our VSAI service</h1>
      <p>
        Verification code
      </p>
      <p>
        ${ process.env.NEXT_PUBLIC_APP_URL + "/verify?email=" + email +"&token=" + verificationToken.token}
      </p>
      <p>
        If you didn’t request this, please ignore this email.
      </p>
      <p>Best regards,<br /></p>
      <p>VSAI Team <br /></p>
      <p>AI Agent for Your Business <br /></p>
    </div>
</div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Error sending email:', error);
        }
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', info);
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
