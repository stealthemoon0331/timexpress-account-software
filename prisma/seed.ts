import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst(); // Assuming you already have a user in the database

  if (!user) {
    console.log("No user found! Please create a user first.");
    return;
  }

  const notifications = [
    {
      userId: user.id,
      title: "Welcome to the platform!",
      message: "Thank you for joining. We're excited to have you!",
      read: false,
    },
    {
      userId: user.id,
      title: "Subscription Expiring Soon",
      message: "Your subscription will expire in 3 days. Renew to continue.",
      read: false,
    },
    {
      userId: user.id,
      title: "Payment Received",
      message: "We received your payment of $50. Thank you!",
      read: true,
    },
  ];

  await prisma.notification.createMany({ data: notifications });
  console.log("Notifications seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
