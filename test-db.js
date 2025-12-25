const { PrismaClient } = require("./src/generated/prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const grades = await prisma.grade.findMany();
    console.log("Current grades:", grades);
    if (grades.length > 0) {
      const g = grades[0];
      const updated = await prisma.grade.update({
        where: { id: g.id },
        data: { status: "ACTIVE" }
      });
      console.log("Update success:", updated);
    }
  } catch (e) {
    console.error("Update failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

