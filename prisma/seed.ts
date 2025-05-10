const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const systems = [
    {
      name: "CRM",
    },
    {
      name: "WMS",
    },
    {
      name: "TMS",
    },
    {
      name: "FMS",
    },
  ];

  const plans = [
    {
      id: "free-trial",
      name: "Free Trial",
      description: "30-day free trial with all features",
      price: 0,
      features: [
        "All Shiper.io products",
        "Unlimited usage during trial",
        "Email support",
        "Automatic conversion to monthly plan after trial",
      ],
      current: true,
      paypalPlanId: "",
      systems: ["CRM", "WMS", "FMS"],
    },
    {
      id: "starter",
      name: "Starter",
      description: "30-day free trial, then $15/month",
      price: 15,
      features: [
        "CRM",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
      paypalPlanId: "",
      systems: ["CRM"],
    },
    {
      id: "pro-suite",
      name: "Pro Suite",
      description: "30-day free trial, then $29/month",
      price: 29,
      features: [
        "CRM",
        "WMS",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
      paypalPlanId: "",
      systems: ["CRM", "WMS"],
    },
    {
      id: "elite",
      name: "Elite",
      description: "30-day free trial, then $49/month",
      price: 49,
      features: [
        "CRM",
        "WMS",
        "FMS",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
      paypalPlanId: "",
      systems: ["CRM", "WMS", "FMS"],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  await prisma.system.createMany({
    data: systems,
    skipDuplicates: true, // This will avoid errors if the same records already exist
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
