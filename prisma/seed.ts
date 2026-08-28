// import { PrismaClient, UserRole } from "@prisma/client";
// import bcryptjs from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//   // Clear existing data
//   await prisma.user.deleteMany();

//   const testPassword = "Test123!@#";
//   const hashedPassword = await bcryptjs.hash(testPassword, 10);

//   const roles: UserRole[] = [
//     "admin",
//     "doctor",
//     "pharmacist",
//     "lab_staff",
//     "records_officer",
//   ];

//   console.log("\n🌱 Seeding database with test users...\n");

//   for (const role of roles) {
//     const user = await prisma.user.create({
//       data: {
//         email: `${role}@hospital.local`,
//         name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
//         password_hash: hashedPassword,
//         role,
//       },
//     });

//     console.log(`✓ Created ${role} user:`);
//     console.log(`  Email: ${user.email}`);
//     console.log(`  Password: ${testPassword}`);
//     console.log(`  Role: ${user.role}\n`);
//   }

//   console.log("✓ Database seeded successfully!");
// }

// main()
//   .catch((e) => {
//     console.error("Seed failed:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
