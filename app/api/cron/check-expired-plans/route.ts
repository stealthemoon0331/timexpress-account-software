// /app/api/cron/check-expired-plans/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const expiredUsers = await prisma.user.findMany({
    where: {
      planExpiresAt: { lt: new Date() },
      payfortCardTokenName: { not: null },
    },
  });

  const results = [];

  for (const user of expiredUsers) {

    if (!user.planId) continue;

    const amount = await prisma.plan.findUnique({
      where: { id: user.planId },
      select: {
        price: true,
      },
    });

    if(!amount) continue;

    const response = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        payfortAgreementId: true,
      }
    })

    console.log("* agreement_id => ", response?.payfortAgreementId);

    if(!response?.payfortAgreementId) continue;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/payfort/recurring`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({
          userId: user.id,
          token: user.payfortCardTokenName,
          agreement_id: response?.payfortAgreementId,
          customer_email: user.email,
          amount: amount.price * 100,
        }),
      }
    );

    const resData = await res.json();

    if (res.status === 200 && resData.response_code === "14000") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          planActivatedAt: new Date(),
          planExpiresAt: new Date(
            Date.now() +
              Number(process.env.TRIAL_DURATION) * 24 * 60 * 60 * 1000
          ),
          planExpired: 0
        },
      });

      results.push({ userId: user.id, success: true });
    } else {
      results.push({ userId: user.id, success: false });
    }
  }

  return NextResponse.json({ checked: results });
}
