import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connect } from "../config/database";
import Account from "../models/account.model";
import Role from "../models/role.model";
import { allPermissions } from "../config/permissions";
import { email, password } from "../helpers/http";
import { hashPassword } from "../helpers/auth";

const main = async () => {
  const adminEmail = email(process.env.ADMIN_EMAIL);
  const adminPassword = password(process.env.ADMIN_PASSWORD);
  await connect();
  const existing = await Account.findOne({ email: adminEmail });
  if (existing) {
    if (!existing.isSuperAdmin || existing.deleted || existing.status !== "active") throw new Error("Email đã có tài khoản. Chọn email khác để tạo quản trị cao nhất.");
    console.log("Tài khoản quản trị đã tồn tại. Giữ nguyên thông tin và mật khẩu.");
    return;
  }
  const role = await Role.create({ title: "Quản trị", description: "Quản lý toàn bộ ứng dụng", permissions: allPermissions });
  await Account.create({ fullName: process.env.ADMIN_NAME || "Quản trị viên", email: adminEmail, password: await hashPassword(adminPassword), roleId: role.id, isSuperAdmin: true });
  console.log("Đã tạo tài khoản quản trị. Đăng nhập tại /admin/auth/login.");
};
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
