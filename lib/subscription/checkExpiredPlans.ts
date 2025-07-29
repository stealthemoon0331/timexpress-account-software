// lib/subscription/checkExpiredPlans.ts

import prisma from "../prisma";

export async function checkAndExpirePlans() {
  const now = new Date();

  const usersToExpire = await prisma.user.findMany({
    where: {
      planExpiresAt: {
        lte: now,
      },
      NOT: {
        planId: null,
      },
    },
  });

  for (const user of usersToExpire) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planId: null,
        paypalSubscriptionId: null,
        planExpiresAt: null,
      },
    });

    console.log(`f Plan expired for user ${user.email}`);
  }
}
