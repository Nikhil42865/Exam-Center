"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradingService = exports.GradingService = void 0;
class GradingService {
    /**
     * Pure deterministic grading function.
     * Compares saved answers against snapshot questions.
     */
    grade(snapshotQuestions, savedAnswers, passingPercentage) {
        const answerMap = new Map();
        for (const ans of savedAnswers) {
            answerMap.set(ans.questionId, ans.selectedOptionId);
        }
        let rawScore = 0;
        let maximumMarks = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        const questionResults = [];
        for (const q of snapshotQuestions) {
            maximumMarks += q.marks;
            const selected = answerMap.get(q.questionId);
            if (!selected) {
                // FR-GRADE-04: Unanswered question: award zero and subtract zero
                unansweredCount++;
                questionResults.push({
                    questionId: q.questionId,
                    selectedOptionId: undefined,
                    correctOptionId: q.correctOptionId,
                    isCorrect: false,
                    marksAwarded: 0,
                    marksPossible: q.marks,
                });
            }
            else if (selected === q.correctOptionId) {
                // FR-GRADE-02: Correct answer: award configured positive marks
                correctCount++;
                rawScore += q.marks;
                questionResults.push({
                    questionId: q.questionId,
                    selectedOptionId: selected,
                    correctOptionId: q.correctOptionId,
                    isCorrect: true,
                    marksAwarded: q.marks,
                    marksPossible: q.marks,
                });
            }
            else {
                // FR-GRADE-03: Incorrect answer: subtract configured negative marks
                incorrectCount++;
                const penalty = q.negativeMarks || 0;
                rawScore -= penalty;
                questionResults.push({
                    questionId: q.questionId,
                    selectedOptionId: selected,
                    correctOptionId: q.correctOptionId,
                    isCorrect: false,
                    marksAwarded: -penalty,
                    marksPossible: q.marks,
                });
            }
        }
        // FR-GRADE-05: Final score bounded below by zero
        const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
        // FR-GRADE-06: Percentage MUST use total positive marks
        const percentage = maximumMarks > 0 ? Math.round((finalScore / maximumMarks) * 10000) / 100 : 0;
        // FR-GRADE-07: Pass/fail MUST use the snapshotted passing percentage
        const passed = percentage >= passingPercentage;
        return {
            score: finalScore,
            maximumMarks: Math.round(maximumMarks * 100) / 100,
            percentage,
            passed,
            correctCount,
            incorrectCount,
            unansweredCount,
            questionResults,
        };
    }
}
exports.GradingService = GradingService;
exports.gradingService = new GradingService();
