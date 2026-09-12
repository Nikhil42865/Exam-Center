"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attemptService = exports.AttemptService = void 0;
const attempt_model_js_1 = require("./attempt.model.js");
const exam_model_js_1 = require("../exams/exam.model.js");
const subject_model_js_1 = require("../subjects/subject.model.js");
const question_model_js_1 = require("../questions/question.model.js");
const grading_service_js_1 = require("../grading/grading.service.js");
const errors_js_1 = require("../../shared/errors.js");
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
class AttemptService {
    async startOrResumeAttempt(examId, userId) {
        const exam = await exam_model_js_1.ExamModel.findById(examId);
        if (!exam || exam.status !== "published") {
            throw errors_js_1.AppError.badRequest("Exam is not available");
        }
        const subject = await subject_model_js_1.SubjectModel.findOne({ _id: exam.subjectId, isActive: true });
        if (!subject) {
            throw errors_js_1.AppError.badRequest("Subject is not currently active");
        }
        const now = new Date();
        if (exam.availableFrom && now < exam.availableFrom) {
            throw errors_js_1.AppError.badRequest("Exam availability period has not started yet");
        }
        if (exam.availableUntil && now > exam.availableUntil) {
            throw errors_js_1.AppError.badRequest("Exam availability period has ended");
        }
        // Check for existing active attempt (FR-ATTEMPT-03: Only one in_progress attempt per candidate per exam)
        const existingActive = await attempt_model_js_1.AttemptModel.findOne({
            examId,
            userId,
            status: "in_progress",
        });
        if (existingActive) {
            // Check if it has expired in the meantime
            if (now > existingActive.expiresAt) {
                await this.autoFinalizeExpiredAttempt(existingActive);
            }
            else {
                return existingActive.toActiveDto();
            }
        }
        // Check attempt limit
        const pastAttemptsCount = await attempt_model_js_1.AttemptModel.countDocuments({
            examId,
            userId,
            status: { $in: ["submitted", "expired"] },
        });
        if (pastAttemptsCount >= exam.attemptLimit) {
            throw errors_js_1.AppError.badRequest("You have reached the maximum allowed attempts for this exam");
        }
        // Load questions to create immutable snapshot (FR-ATTEMPT-05)
        let questions = await question_model_js_1.QuestionModel.find({ examId }).sort({ order: 1 });
        if (questions.length === 0) {
            throw errors_js_1.AppError.badRequest("Exam has no questions");
        }
        if (exam.shuffleQuestions) {
            questions = shuffleArray(questions);
        }
        const snapshotQuestions = questions.map((q, idx) => {
            let options = q.options.map((o) => ({ id: o.id, text: o.text }));
            if (exam.shuffleOptions) {
                options = shuffleArray(options);
            }
            return {
                questionId: q._id.toString(),
                text: q.text,
                options,
                correctOptionId: q.correctOptionId,
                explanation: q.explanation,
                marks: q.marks,
                negativeMarks: q.negativeMarks || 0,
                order: idx + 1,
            };
        });
        const startedAt = new Date();
        const expiresAt = new Date(startedAt.getTime() + exam.durationMinutes * 60 * 1000);
        const attempt = await attempt_model_js_1.AttemptModel.create({
            examId: exam._id,
            examVersion: exam.version,
            userId,
            sequenceNumber: pastAttemptsCount + 1,
            status: "in_progress",
            startedAt,
            expiresAt,
            snapshot: {
                title: exam.title,
                passingPercentage: exam.passingPercentage,
                durationMinutes: exam.durationMinutes,
                questions: snapshotQuestions,
            },
            answers: [],
        });
        return attempt.toActiveDto();
    }
    async getActiveAttempt(attemptId, userId) {
        const attempt = await attempt_model_js_1.AttemptModel.findById(attemptId);
        if (!attempt) {
            throw errors_js_1.AppError.notFound("Attempt not found");
        }
        if (attempt.userId.toString() !== userId) {
            throw errors_js_1.AppError.forbidden("You do not have permission to access this attempt");
        }
        const now = new Date();
        if (attempt.status === "in_progress" && now > attempt.expiresAt) {
            await this.autoFinalizeExpiredAttempt(attempt);
            throw errors_js_1.AppError.badRequest("Time for this attempt has expired and it was automatically submitted.");
        }
        if (attempt.status !== "in_progress") {
            throw errors_js_1.AppError.badRequest("This attempt is already submitted.");
        }
        return attempt.toActiveDto();
    }
    async saveAnswer(attemptId, questionId, dto, userId) {
        const attempt = await attempt_model_js_1.AttemptModel.findById(attemptId);
        if (!attempt) {
            throw errors_js_1.AppError.notFound("Attempt not found");
        }
        if (attempt.userId.toString() !== userId) {
            throw errors_js_1.AppError.forbidden("Access denied");
        }
        const now = new Date();
        if (attempt.status !== "in_progress" || now > attempt.expiresAt) {
            if (attempt.status === "in_progress") {
                await this.autoFinalizeExpiredAttempt(attempt);
            }
            throw errors_js_1.AppError.badRequest("Cannot update answer: attempt has expired or already submitted");
        }
        // Verify question belongs to attempt snapshot
        const question = attempt.snapshot.questions.find((q) => q.questionId === questionId);
        if (!question) {
            throw errors_js_1.AppError.badRequest("Question does not belong to this exam attempt");
        }
        // If selecting an option, verify option belongs to question
        if (dto.selectedOptionId && !question.options.some((o) => o.id === dto.selectedOptionId)) {
            throw errors_js_1.AppError.badRequest("Selected option does not belong to this question");
        }
        // Upsert answer
        const existingIndex = attempt.answers.findIndex((a) => a.questionId === questionId);
        const savedAt = new Date();
        if (existingIndex >= 0) {
            attempt.answers[existingIndex].selectedOptionId = dto.selectedOptionId ?? undefined;
            attempt.answers[existingIndex].isFlagged = dto.isFlagged;
            attempt.answers[existingIndex].savedAt = savedAt;
        }
        else {
            attempt.answers.push({
                questionId,
                selectedOptionId: dto.selectedOptionId ?? undefined,
                isFlagged: dto.isFlagged,
                savedAt,
            });
        }
        await attempt.save();
        return { success: true, savedAt: savedAt.toISOString() };
    }
    async submitAttempt(attemptId, userId) {
        const attempt = await attempt_model_js_1.AttemptModel.findById(attemptId);
        if (!attempt) {
            throw errors_js_1.AppError.notFound("Attempt not found");
        }
        if (attempt.userId.toString() !== userId) {
            throw errors_js_1.AppError.forbidden("Access denied");
        }
        const exam = await exam_model_js_1.ExamModel.findById(attempt.examId);
        const showAnswers = exam ? exam.showAnswersAfterSubmit : false;
        // Idempotent submit (FR-ATTEMPT-10): if already submitted or expired, return stored result
        if (attempt.status !== "in_progress" && attempt.result) {
            return attempt.toResultSummaryDto(showAnswers);
        }
        const gradeResult = grading_service_js_1.gradingService.grade(attempt.snapshot.questions, attempt.answers, attempt.snapshot.passingPercentage);
        attempt.status = "submitted";
        attempt.submittedAt = new Date();
        attempt.result = {
            score: gradeResult.score,
            maximumMarks: gradeResult.maximumMarks,
            percentage: gradeResult.percentage,
            passed: gradeResult.passed,
            correctCount: gradeResult.correctCount,
            incorrectCount: gradeResult.incorrectCount,
            unansweredCount: gradeResult.unansweredCount,
        };
        await attempt.save();
        return attempt.toResultSummaryDto(showAnswers);
    }
    async autoFinalizeExpiredAttempt(attempt) {
        if (attempt.status !== "in_progress")
            return;
        const gradeResult = grading_service_js_1.gradingService.grade(attempt.snapshot.questions, attempt.answers, attempt.snapshot.passingPercentage);
        attempt.status = "expired";
        attempt.submittedAt = attempt.expiresAt;
        attempt.result = {
            score: gradeResult.score,
            maximumMarks: gradeResult.maximumMarks,
            percentage: gradeResult.percentage,
            passed: gradeResult.passed,
            correctCount: gradeResult.correctCount,
            incorrectCount: gradeResult.incorrectCount,
            unansweredCount: gradeResult.unansweredCount,
        };
        await attempt.save();
    }
    async getResult(attemptId, userId) {
        const attempt = await attempt_model_js_1.AttemptModel.findById(attemptId);
        if (!attempt) {
            throw errors_js_1.AppError.notFound("Attempt not found");
        }
        if (attempt.userId.toString() !== userId) {
            throw errors_js_1.AppError.forbidden("Access denied");
        }
        if (attempt.status === "in_progress") {
            const now = new Date();
            if (now > attempt.expiresAt) {
                await this.autoFinalizeExpiredAttempt(attempt);
            }
            else {
                throw errors_js_1.AppError.badRequest("Attempt is still in progress");
            }
        }
        const exam = await exam_model_js_1.ExamModel.findById(attempt.examId);
        const showScore = exam ? exam.showScoreAfterSubmit : true;
        const showAnswers = exam ? exam.showAnswersAfterSubmit : false;
        if (!showScore) {
            throw errors_js_1.AppError.badRequest("Score results are not visible for this exam according to policy.");
        }
        const summary = attempt.toResultSummaryDto(showAnswers);
        const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOptionId]));
        // Build question breakdown if policy allows answer review (FR-RESULT-03)
        const questions = showAnswers
            ? attempt.snapshot.questions.map((q) => {
                const selected = answerMap.get(q.questionId);
                const isCorrect = selected === q.correctOptionId;
                const marksAwarded = !selected ? 0 : isCorrect ? q.marks : -(q.negativeMarks || 0);
                return {
                    questionId: q.questionId,
                    order: q.order,
                    text: q.text,
                    options: q.options,
                    selectedOptionId: selected,
                    correctOptionId: q.correctOptionId,
                    isCorrect,
                    marksAwarded,
                    marksPossible: q.marks,
                    explanation: q.explanation,
                };
            })
            : [];
        return {
            attemptId: attempt._id.toString(),
            examId: attempt.examId.toString(),
            examTitle: attempt.snapshot.title,
            summary,
            questions,
        };
    }
    async getCandidateHistory(userId) {
        const attempts = await attempt_model_js_1.AttemptModel.find({ userId }).sort({ createdAt: -1 });
        const examIds = [...new Set(attempts.map((a) => a.examId.toString()))];
        const exams = await exam_model_js_1.ExamModel.find({ _id: { $in: examIds } });
        const examMap = new Map(exams.map((e) => [e._id.toString(), e]));
        const subjectIds = [...new Set(exams.map((e) => e.subjectId.toString()))];
        const subjects = await subject_model_js_1.SubjectModel.find({ _id: { $in: subjectIds } });
        const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));
        return attempts.map((a) => {
            const exam = examMap.get(a.examId.toString());
            const subjectName = exam ? subjectMap.get(exam.subjectId.toString()) || "" : "";
            const showScore = exam ? exam.showScoreAfterSubmit : true;
            const showAnswers = exam ? exam.showAnswersAfterSubmit : false;
            return {
                id: a._id.toString(),
                examId: a.examId.toString(),
                examTitle: a.snapshot.title,
                subjectName,
                sequenceNumber: a.sequenceNumber,
                status: a.status,
                score: showScore ? a.result?.score : undefined,
                maximumMarks: showScore ? a.result?.maximumMarks : undefined,
                percentage: showScore ? a.result?.percentage : undefined,
                passed: showScore ? a.result?.passed : undefined,
                startedAt: a.startedAt.toISOString(),
                submittedAt: a.submittedAt?.toISOString(),
                showScoreAfterSubmit: showScore,
                showAnswersAfterSubmit: showAnswers,
            };
        });
    }
}
exports.AttemptService = AttemptService;
exports.attemptService = new AttemptService();
