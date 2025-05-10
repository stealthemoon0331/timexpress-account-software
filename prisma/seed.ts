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
