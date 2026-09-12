import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import { config } from "../src/config/index.js";
import { UserModel } from "../src/modules/users/user.model.js";
import { ExamModel } from "../src/modules/exams/exam.model.js";
import { AttemptModel } from "../src/modules/attempts/attempt.model.js";

describe("Complete End-to-End User & Exam Lifecycle", () => {
  const app = createApp();

  beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI);
  });

  afterAll(async () => {
    // Cleanup created test candidate and test attempts
    const testCandidate = await UserModel.findOne({ email: "journey.candidate@test.com" });
    if (testCandidate) {
      await AttemptModel.deleteMany({ userId: testCandidate._id });
      await UserModel.deleteOne({ _id: testCandidate._id });
    }
    await mongoose.disconnect();
  });

  it("Full Candidate Journey: Register -> Discover Exam -> Start Attempt -> Save Answers -> Submit -> Verify Result -> History", async () => {
    // 1. Candidate Registration
    const regRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Journey Candidate",
        email: "journey.candidate@test.com",
        password: "SecurePass123!",
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    const candidateCookies = regRes.headers["set-cookie"];

    // 2. Discover active exams in catalogue
    const examsRes = await request(app)
      .get("/api/v1/exams")
      .set("Cookie", candidateCookies);

    expect(examsRes.status).toBe(200);
    expect(examsRes.body.success).toBe(true);
    expect(examsRes.body.data.length).toBeGreaterThan(0);

    const exam = examsRes.body.data.find(
      (e: any) => e.slug === "computer-networks-fundamentals"
    ) || examsRes.body.data[0];

    expect(exam).toBeDefined();
    expect(exam.isEligible).toBe(true);

    // 3. Start Exam Attempt
    const startRes = await request(app)
      .post(`/api/v1/exams/${exam.id}/attempts`)
      .set("Cookie", candidateCookies);

    expect(startRes.status).toBe(201);
    expect(startRes.body.success).toBe(true);
    const attempt = startRes.body.data;
    expect(attempt.status).toBe("in_progress");
    expect(attempt.questions.length).toBe(exam.questionCount);
    expect(attempt.serverNow).toBeDefined();

    // Critical security check: NO correctOptionId in candidate active attempt payload
    for (const q of attempt.questions) {
      expect(q.correctOptionId).toBeUndefined();
      expect(q.isCorrect).toBeUndefined();
    }

    // 4. Answer Question 1: Select first option
    const q1 = attempt.questions[0];
    const q1Option = q1.options[0].id;
    const saveRes1 = await request(app)
      .put(`/api/v1/attempts/${attempt.id}/answers/${q1.id}`)
      .set("Cookie", candidateCookies)
      .send({
        selectedOptionId: q1Option,
        isFlagged: false,
      });

    expect(saveRes1.status).toBe(200);
    expect(saveRes1.body.success).toBe(true);

    // 5. Answer Question 2: Select first option & flag
    const q2 = attempt.questions[1];
    const q2Option = q2.options[0].id;
    const saveRes2 = await request(app)
      .put(`/api/v1/attempts/${attempt.id}/answers/${q2.id}`)
      .set("Cookie", candidateCookies)
      .send({
        selectedOptionId: q2Option,
        isFlagged: true,
      });

    expect(saveRes2.status).toBe(200);
    expect(saveRes2.body.success).toBe(true);

    // 6. Submit the attempt
    const submitRes = await request(app)
      .post(`/api/v1/attempts/${attempt.id}/submit`)
      .set("Cookie", candidateCookies);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    const resultSummary = submitRes.body.data;

    expect(resultSummary.status).toBe("submitted");
    expect(resultSummary.score).toBeDefined();
    expect(resultSummary.maximumMarks).toBeGreaterThan(0);
    expect(resultSummary.counts.total).toBe(exam.questionCount);

    // 7. Idempotent submission: submitting again returns the same result
    const reSubmitRes = await request(app)
      .post(`/api/v1/attempts/${attempt.id}/submit`)
      .set("Cookie", candidateCookies);

    expect(reSubmitRes.status).toBe(200);
    expect(reSubmitRes.body.data.score).toBe(resultSummary.score);

    // 8. View Result and detailed review
    const reviewRes = await request(app)
      .get(`/api/v1/attempts/${attempt.id}/result`)
      .set("Cookie", candidateCookies);

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.data.summary.status).toBe("submitted");

    // 9. View Candidate Attempt History
    const historyRes = await request(app)
      .get("/api/v1/attempts")
      .set("Cookie", candidateCookies);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.success).toBe(true);
    expect(historyRes.body.data.length).toBe(1);
    expect(historyRes.body.data[0].id).toBe(attempt.id);
  });
});
