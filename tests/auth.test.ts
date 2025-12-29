import request from "supertest";
import { app } from "../src/server.js";
import { User } from "../src/models/UserModel.js";
import bcrypt from "bcrypt";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "crypto";

describe("Auth API Tests", () => {
  const testUser = {
    email: "test@test.com",
    username: "tester",
    password: "123456",
  };

  let resetRawToken: string;

  beforeAll(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  it("1. Register user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(201);

    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeTruthy();
    expect(user?.isVerified).toBe(false);
  });

  it("2. Manually verify user (bypassing email)", async () => {
    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeTruthy();

    user!.isVerified = true;
    user!.emailVerificationToken = undefined;
    user!.emailVerificationExpires = undefined;
    await user!.save();

    const verifiedUser = await User.findOne({ email: testUser.email });
    expect(verifiedUser?.isVerified).toBe(true);
  });

  it("3. Login user", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      identifier: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.accessTkn).toBeTruthy();
  });

  it("4. Forgot password (create reset token)", async () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await User.updateOne(
      { email: testUser.email },
      {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      }
    );

    resetRawToken = rawToken;

    const user = await User.findOne({ email: testUser.email }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    expect(user?.passwordResetToken).toBeTruthy();
  });

  it("5. Reset password using token", async () => {
    const newPassword = "newStrongPass123";

    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: resetRawToken, newPassword });

    expect(res.status).toBe(200);

    const user = await User.findOne({ email: testUser.email }).select(
      "+password"
    );

    expect(await bcrypt.compare(newPassword, user!.password)).toBe(true);
  });
});
