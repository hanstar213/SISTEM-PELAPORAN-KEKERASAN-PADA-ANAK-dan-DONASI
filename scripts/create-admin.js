#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

(async () => {
  const prisma = new PrismaClient();
  const email = process.argv[2] || "admin@gmail.com";
  const password = process.argv[3] || "admin123";

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashed, role: "ADMIN", name: "Admin" },
      create: { email, password: hashed, role: "ADMIN", name: "Admin" },
    });

    console.log("Admin user created/updated:", user.email);
  } catch (err) {
    console.error("Failed to create admin:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
