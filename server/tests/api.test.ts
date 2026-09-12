import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import { config } from "../src/config/index.js";
import { UserModel } from "../src/modules/users/user.model.js";

describe("API Endpoints & Authentication", () => {
  const app = createApp();

  beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI);
  });

  afterAll(async () => {
    // Clean up test users
    await UserModel.deleteMany({ email: /@test-examcenter\.com$/ });
    await mongoose.disconnect();
  });

  it("GET /api/v1/health returns status ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });

  it("POST /api/v1/auth/register registers candidate and prevents admin self-assignment", async () => {
    const candidateData = {
      name: "Test Candidate",
      email: "candidate1@test-examcenter.com",
      password: "CandidatePass123!",
      role: "admin", // Malicious attempt to self-assign admin role
    };

    const res = await request(app).post("/api/v1/auth/register").send(candidateData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("candidate1@test-examcenter.com");
    // Must be forced to candidate role!
    expect(res.body.data.user.role).toBe("candidate");
  });

  it("POST /api/v1/auth/login logs in valid candidate", async () => {
    const loginData = {
      email: "candidate1@test-examcenter.com",
      password: "CandidatePass123!",
    };

    const res = await request(app).post("/api/v1/auth/login").send(loginData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("candidate1@test-examcenter.com");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("Candidate cannot access admin endpoints", async () => {
    // Log in candidate to get cookies
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "candidate1@test-examcenter.com",
      password: "CandidatePass123!",
    });

    const cookie = loginRes.headers["set-cookie"];

    // Try accessing admin dashboard
    const adminRes = await request(app).get("/api/v1/admin/dashboard").set("Cookie", cookie);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.error.code).toBe("FORBIDDEN");
  });
});
