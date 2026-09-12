import bcrypt from "bcrypt";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { config } from "./config/index.js";
import { UserModel } from "./modules/users/user.model.js";
import { logger } from "./shared/logger.js";

async function seedAdmin(): Promise<void> {
  await connectDatabase();

  const adminEmail = config.ADMIN_INITIAL_EMAIL.toLowerCase();
  const existingAdmin = await UserModel.findOne({ email: adminEmail });

  if (existingAdmin) {
    logger.info(`Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(config.ADMIN_INITIAL_PASSWORD, 10);
    const admin = await UserModel.create({
      name: config.ADMIN_INITIAL_NAME,
      email: adminEmail,
      passwordHash,
      role: "admin",
      status: "active",
    });
    logger.info(`✅ Initial admin user created successfully: ${admin.email} (ID: ${admin._id})`);
  }

  await disconnectDatabase();
}

seedAdmin().catch((err) => {
  logger.error({ err }, "Admin seeding failed:");
  process.exit(1);
});
