import bcrypt from "bcrypt";
import { UserRole } from "../modules/user/user.interface";
import UserModel from "../modules/user/user.model";
import config from "../config";

const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = config.super_admin_email || "admin@gmail.com";
    const superAdminPassword = config.super_admin_password || "123456";
    const superAdminFirstName = config.super_admin_first_name || "Super";
    const superAdminLastName = config.super_admin_last_name || "Admin";

    // Check if a super admin already exists
    const isSuperAdminExist = await UserModel.findOne({ role: UserRole.ADMIN });

    const saltRounds = parseInt(config.bcrypt_salt_rounds!);
    const hashedPassword = await bcrypt.hash(superAdminPassword, saltRounds);

    if (!isSuperAdminExist) {
      // Create super admin
      await UserModel.create({
        email: superAdminEmail,
        password: hashedPassword,
        firstName: superAdminFirstName, // Use firstName
        lastName: superAdminLastName, // Use lastName
        role: UserRole.ADMIN,
        verified: true,
        isActive: true,
      });

      console.log("✅ Super Admin user created successfully.");
    } else {
      // Update super admin
      await UserModel.updateOne(
        { _id: isSuperAdminExist._id },
        {
          email: superAdminEmail,
          password: hashedPassword,
          firstName: superAdminFirstName,
          lastName: superAdminLastName,
          verified: true,
          isActive: true,
        }
      );
      console.log("ℹ️ Super Admin already exists, info updated from env.");
    }
  } catch (error) {
    console.error("❌ Error seeding Super Admin user:", error);
  }
};

export default seedSuperAdmin;
