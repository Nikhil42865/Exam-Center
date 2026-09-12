import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import { config } from "../src/config/index.js";
import { UserModel } from "../src/modules/users/user.model.js";
import { SubjectModel } from "../src/modules/subjects/subject.model.js";
import { ExamModel } from "../src/modules/exams/exam.model.js";
import { QuestionModel } from "../src/modules/questions/question.model.js";

describe("Bulk Question Import API", () => {
  const app = createApp();
  let adminCookie: string[];
  let testSubjectId: string;
  let testExamId: string;
  let adminUserId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI);

    // Login with seeded admin credentials
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: config.ADMIN_INITIAL_EMAIL,
      password: config.ADMIN_INITIAL_PASSWORD,
    });

    if (loginRes.status !== 200) {
      // If seed wasn't run yet in this environment, find or create admin
      let admin = await UserModel.findOne({ role: "admin" });
      if (!admin) {
        admin = await UserModel.create({
          name: config.ADMIN_INITIAL_NAME,
          email: config.ADMIN_INITIAL_EMAIL,
          passwordHash: await UserModel.hashPassword(config.ADMIN_INITIAL_PASSWORD),
          role: "admin",
        });
      }
      const retryLogin = await request(app).post("/api/v1/auth/login").send({
        email: config.ADMIN_INITIAL_EMAIL,
        password: config.ADMIN_INITIAL_PASSWORD,
      });
      adminCookie = retryLogin.headers["set-cookie"];
      adminUserId = admin._id;
    } else {
      adminCookie = loginRes.headers["set-cookie"];
      const admin = await UserModel.findOne({ email: config.ADMIN_INITIAL_EMAIL });
      adminUserId = admin!._id;
    }

    // 2. Create test subject
    const subject = await SubjectModel.create({
      name: "Bulk Test Subject",
      slug: "bulk-test-subject-" + Date.now(),
      description: "Subject for testing bulk question imports",
      isActive: true,
      createdBy: adminUserId,
    });
    testSubjectId = subject._id.toString();

    // 3. Create test exam
    const exam = await ExamModel.create({
      title: "Bulk Test Exam",
      slug: "bulk-test-exam-" + Date.now(),
      subjectId: testSubjectId,
      instructions: "Testing instructions",
      durationMinutes: 30,
      totalMarks: 0,
      passingPercentage: 50,
      attemptLimit: 1,
      status: "draft",
      createdBy: adminUserId,
    });
    testExamId = exam._id.toString();
  });

  afterAll(async () => {
    if (testExamId) {
      await QuestionModel.deleteMany({ examId: testExamId });
      await ExamModel.deleteOne({ _id: testExamId });
    }
    if (testSubjectId) {
      await SubjectModel.deleteOne({ _id: testSubjectId });
    }
    await mongoose.disconnect();
  });

  it("POST /api/v1/admin/exams/:examId/questions/bulk creates multiple questions with auto-incremented order", async () => {
    const payload = {
      questions: [
        {
          text: "What does HTTP stand for in networking?",
          options: [
            { id: "opt_1", text: "HyperText Transfer Protocol" },
            { id: "opt_2", text: "High Tech Transport Process" },
            { id: "opt_3", text: "Hyperlink Tactical Transmission Path" },
            { id: "opt_4", text: "Home Terminal Telecom Protocol" },
          ],
          correctOptionId: "opt_1",
          marks: 2,
          negativeMarks: 0.5,
          explanation: "HTTP is the foundation of data communication on the World Wide Web.",
        },
        {
          text: "Which layer of the OSI model does IP operate on?",
          options: [
            { id: "opt_1", text: "Physical" },
            { id: "opt_2", text: "Data Link" },
            { id: "opt_3", text: "Network" },
            { id: "opt_4", text: "Transport" },
          ],
          correctOptionId: "opt_3",
          marks: 3,
          negativeMarks: 0,
          explanation: "The Internet Protocol (IP) works at Layer 3, the Network Layer.",
        },
      ],
    };

    const res = await request(app)
      .post(`/api/v1/admin/exams/${testExamId}/questions/bulk`)
      .set("Cookie", adminCookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);

    const q1 = res.body.data[0];
    const q2 = res.body.data[1];

    expect(q1.text).toBe(payload.questions[0].text);
    expect(q1.order).toBe(0);
    expect(q1.marks).toBe(2);
    expect(q1.correctOptionId).toBe("opt_1");

    expect(q2.text).toBe(payload.questions[1].text);
    expect(q2.order).toBe(1);
    expect(q2.marks).toBe(3);
    expect(q2.correctOptionId).toBe("opt_3");

    // Check exam total marks updated
    const updatedExam = await ExamModel.findById(testExamId);
    expect(updatedExam?.totalMarks).toBe(5);
  });

  it("Rejects bulk import if correctOptionId does not match any option", async () => {
    const invalidPayload = {
      questions: [
        {
          text: "Invalid question with mismatched correctOptionId",
          options: [
            { id: "opt_1", text: "First Option" },
            { id: "opt_2", text: "Second Option" },
          ],
          correctOptionId: "opt_999", // Non-existent option
          marks: 1,
          negativeMarks: 0,
        },
      ],
    };

    const res = await request(app)
      .post(`/api/v1/admin/exams/${testExamId}/questions/bulk`)
      .set("Cookie", adminCookie)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("Rejects bulk import if options have fewer than 2 choices", async () => {
    const invalidPayload = {
      questions: [
        {
          text: "Question with only one option",
          options: [
            { id: "opt_1", text: "Single option" },
          ],
          correctOptionId: "opt_1",
          marks: 1,
          negativeMarks: 0,
        },
      ],
    };

    const res = await request(app)
      .post(`/api/v1/admin/exams/${testExamId}/questions/bulk`)
      .set("Cookie", adminCookie)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
