import "dotenv/config";
import prisma from "../lib/prisma";

async function test() {
  try {
    const projects = await prisma.project.findMany({
      take: 1,
    });

    console.log("Database connected ✅");
    console.log(projects);
  } catch (error) {
    console.error("Database error ❌");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();