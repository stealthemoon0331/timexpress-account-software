import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import { addMinutes } from "date-fns"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    // Optionally hide existence of users
    return NextResponse.json({ success: true })
  }

  const token = uuidv4()
  const expires = addMinutes(new Date(), 15)

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_PWD_RESET_TEMPLATE_ID,
    user_id: process.env.EMAILJS_USER_ID,
    accessToken: process.env.EMAILJS_ACCESS_TOKEN,
    template_params: {
      email: email,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    },
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

//   await sendPasswordResetEmail(email, token)

  return NextResponse.json({ success: true })
}
