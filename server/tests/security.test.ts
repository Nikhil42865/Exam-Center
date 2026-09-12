import { describe, it, expect } from "vitest";
import { QuestionModel } from "../src/modules/questions/question.model.js";
import { AttemptModel } from "../src/modules/attempts/attempt.model.js";
import mongoose from "mongoose";

function recursivelyFindKeys(obj: any, targetKeys: string[]): string[] {
  const found: string[] = [];

  function search(current: any) {
    if (!current || typeof current !== "object") return;

    if (Array.isArray(current)) {
      for (const item of current) {
        search(item);
      }
      return;
    }

    for (const key of Object.keys(current)) {
      if (targetKeys.includes(key)) {
        found.push(key);
      }
      search(current[key]);
    }
  }

  search(obj);
  return found;
}

describe("Critical Security: Candidate Data Isolation (Zero Answer Leakage)", () => {
  it("QuestionModel.toCandidateDto strictly strips correctOptionId and explanation", () => {
    const questionDoc = new QuestionModel({
      examId: new mongoose.Types.ObjectId(),
      text: "Which protocol is connection-oriented?",
      type: "single_choice",
      options: [
        { id: "opt_tcp", text: "TCP" },
        { id: "opt_udp", text: "UDP" },
      ],
      correctOptionId: "opt_tcp",
      explanation: "TCP provides reliable, sequenced byte-stream delivery.",
      marks: 2,
      negativeMarks: 0.5,
      order: 1,
    });

    const candidateDto = questionDoc.toCandidateDto();

    const leakedKeys = recursivelyFindKeys(candidateDto, ["correctOptionId", "explanation", "isCorrect"]);
    expect(leakedKeys).toEqual([]);
    expect((candidateDto as any).correctOptionId).toBeUndefined();
    expect((candidateDto as any).explanation).toBeUndefined();
    expect(candidateDto.options.length).toBe(2);
  });

  it("AttemptModel.toActiveDto strictly strips correctOptionId from questions snapshot", () => {
    const attemptDoc = new AttemptModel({
      examId: new mongoose.Types.ObjectId(),
      examVersion: 1,
      userId: new mongoose.Types.ObjectId(),
      sequenceNumber: 1,
      status: "in_progress",
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      snapshot: {
        title: "Network Fundamentals",
        passingPercentage: 70,
        durationMinutes: 15,
        questions: [
          {
            questionId: "q1",
            text: "What port does HTTP use?",
            options: [
              { id: "o1", text: "80" },
              { id: "o2", text: "443" },
            ],
            correctOptionId: "o1",
            explanation: "Port 80 is the default port for HTTP traffic.",
            marks: 1,
            negativeMarks: 0,
            order: 1,
          },
        ],
      },
      answers: [],
    });

    const activeDto = attemptDoc.toActiveDto();

    const leakedKeys = recursivelyFindKeys(activeDto, ["correctOptionId", "explanation", "isCorrect"]);
    expect(leakedKeys).toEqual([]);
    expect((activeDto.questions[0] as any).correctOptionId).toBeUndefined();
    expect((activeDto.questions[0] as any).explanation).toBeUndefined();
  });
});
