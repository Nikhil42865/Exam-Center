import { describe, it, expect } from "vitest";
import { gradingService, SnapshotQuestion } from "../src/modules/grading/grading.service.js";

describe("GradingService (Pure Deterministic Scoring)", () => {
  const sampleQuestions: SnapshotQuestion[] = [
    {
      questionId: "q1",
      text: "Question 1",
      options: [
        { id: "o1", text: "Option 1" },
        { id: "o2", text: "Option 2" },
      ],
      correctOptionId: "o1",
      marks: 2,
      negativeMarks: 0.5,
      order: 1,
    },
    {
      questionId: "q2",
      text: "Question 2",
      options: [
        { id: "o3", text: "Option 3" },
        { id: "o4", text: "Option 4" },
      ],
      correctOptionId: "o4",
      marks: 3,
      negativeMarks: 1,
      order: 2,
    },
    {
      questionId: "q3",
      text: "Question 3",
      options: [
        { id: "o5", text: "Option 5" },
        { id: "o6", text: "Option 6" },
      ],
      correctOptionId: "o5",
      marks: 5,
      negativeMarks: 0,
      order: 3,
    },
  ]; // Total marks: 2 + 3 + 5 = 10

  it("scores 100% when all answers are correct", () => {
    const answers = [
      { questionId: "q1", selectedOptionId: "o1" },
      { questionId: "q2", selectedOptionId: "o4" },
      { questionId: "q3", selectedOptionId: "o5" },
    ];

    const result = gradingService.grade(sampleQuestions, answers, 60);

    expect(result.score).toBe(10);
    expect(result.maximumMarks).toBe(10);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctCount).toBe(3);
    expect(result.incorrectCount).toBe(0);
    expect(result.unansweredCount).toBe(0);
  });

  it("floors score at 0 when negative marks exceed positive score", () => {
    // All answers wrong: penalty = 0.5 + 1.0 + 0 = -1.5 -> clamped to 0
    const answers = [
      { questionId: "q1", selectedOptionId: "o2" },
      { questionId: "q2", selectedOptionId: "o3" },
      { questionId: "q3", selectedOptionId: "o6" },
    ];

    const result = gradingService.grade(sampleQuestions, answers, 50);

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.correctCount).toBe(0);
    expect(result.incorrectCount).toBe(3);
    expect(result.unansweredCount).toBe(0);
  });

  it("awards 0 and penalizes 0 for unanswered questions", () => {
    // Only q1 answered correctly, q2 and q3 unanswered
    const answers = [{ questionId: "q1", selectedOptionId: "o1" }];

    const result = gradingService.grade(sampleQuestions, answers, 20);

    expect(result.score).toBe(2);
    expect(result.percentage).toBe(20);
    expect(result.passed).toBe(true); // Exact threshold 20%
    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(0);
    expect(result.unansweredCount).toBe(2);
  });

  it("correctly handles mixed answers with negative marks", () => {
    // q1 correct (+2), q2 incorrect (-1), q3 unanswered (0)
    // Score = 2 - 1 = 1 / 10 = 10%
    const answers = [
      { questionId: "q1", selectedOptionId: "o1" },
      { questionId: "q2", selectedOptionId: "o3" },
    ];

    const result = gradingService.grade(sampleQuestions, answers, 50);

    expect(result.score).toBe(1);
    expect(result.percentage).toBe(10);
    expect(result.passed).toBe(false);
    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(1);
    expect(result.unansweredCount).toBe(1);
  });
});
