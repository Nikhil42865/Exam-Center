import {
  AdminDashboardMetricsDto,
  AdminAttemptListItemDto,
  AdminAttemptDetailDto,
} from "@examcenter/contracts";
import { AttemptModel } from "../attempts/attempt.model.js";
import { ExamModel } from "../exams/exam.model.js";
import { SubjectModel } from "../subjects/subject.model.js";
import { UserModel } from "../users/user.model.js";
import { AppError } from "../../shared/errors.js";

export class ReportsService {
  async getDashboardMetrics(): Promise<AdminDashboardMetricsDto> {
    const totalSubjects = await SubjectModel.countDocuments();
    const totalExams = await ExamModel.countDocuments();
    const publishedExams = await ExamModel.countDocuments({ status: "published" });
    const draftExams = await ExamModel.countDocuments({ status: "draft" });
    const archivedExams = await ExamModel.countDocuments({ status: "archived" });

    const totalAttempts = await AttemptModel.countDocuments();
    const completedAttempts = await AttemptModel.countDocuments({
      status: { $in: ["submitted", "expired"] },
    });

    const completed = await AttemptModel.find({
      status: { $in: ["submitted", "expired"] },
      "result.score": { $exists: true },
    });

    let averageScorePercentage = 0;
    let passRatePercentage = 0;

    if (completed.length > 0) {
      const totalPct = completed.reduce((acc, curr) => acc + (curr.result?.percentage || 0), 0);
      averageScorePercentage = Math.round((totalPct / completed.length) * 100) / 100;

      const passedCount = completed.filter((c) => c.result?.passed).length;
      passRatePercentage = Math.round((passedCount / completed.length) * 10000) / 100;
    }

    const recent = await this.getAttempts({ limit: 10 });

    return {
      totalExams,
      publishedExams,
      draftExams,
      archivedExams,
      totalSubjects,
      totalAttempts,
      completedAttempts,
      averageScorePercentage,
      passRatePercentage,
      recentAttempts: recent,
    };
  }

  async getAttempts(filters: {
    examId?: string;
    status?: string;
    passed?: boolean;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<AdminAttemptListItemDto[]> {
    const query: any = {};
    if (filters.examId) query.examId = filters.examId;
    if (filters.status) query.status = filters.status;
    if (filters.passed !== undefined) query["result.passed"] = filters.passed;

    const attempts = await AttemptModel.find(query)
      .sort({ createdAt: -1 })
      .skip(filters.skip || 0)
      .limit(filters.limit || 50);

    const userIds = [...new Set(attempts.map((a) => a.userId.toString()))];
    const examIds = [...new Set(attempts.map((a) => a.examId.toString()))];

    const users = await UserModel.find({ _id: { $in: userIds } });
    const exams = await ExamModel.find({ _id: { $in: examIds } });
    const subjects = await SubjectModel.find();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const examMap = new Map(exams.map((e) => [e._id.toString(), e]));
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));

    const items: AdminAttemptListItemDto[] = attempts.map((a) => {
      const user = userMap.get(a.userId.toString());
      const exam = examMap.get(a.examId.toString());
      const subjectName = exam ? subjectMap.get(exam.subjectId.toString()) || "" : "";

      return {
        id: a._id.toString(),
        examId: a.examId.toString(),
        examTitle: a.snapshot.title,
        subjectName,
        candidateId: a.userId.toString(),
        candidateName: user?.name || "Unknown Candidate",
        candidateEmail: user?.email || "Unknown Email",
        sequenceNumber: a.sequenceNumber,
        status: a.status,
        score: a.result?.score ?? 0,
        maximumMarks: a.result?.maximumMarks ?? 0,
        percentage: a.result?.percentage ?? 0,
        passed: a.result?.passed ?? false,
        startedAt: a.startedAt.toISOString(),
        submittedAt: a.submittedAt?.toISOString(),
      };
    });

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return items.filter(
        (i) =>
          i.candidateName.toLowerCase().includes(searchLower) ||
          i.candidateEmail.toLowerCase().includes(searchLower) ||
          i.examTitle.toLowerCase().includes(searchLower)
      );
    }

    return items;
  }

  async getAdminAttemptDetail(attemptId: string): Promise<AdminAttemptDetailDto> {
    const attempt = await AttemptModel.findById(attemptId);
    if (!attempt) throw AppError.notFound("Attempt not found");

    const user = await UserModel.findById(attempt.userId);
    const exam = await ExamModel.findById(attempt.examId);
    const subject = exam ? await SubjectModel.findById(exam.subjectId) : null;

    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOptionId]));

    const questions = attempt.snapshot.questions.map((q) => {
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
    });

    const res = attempt.result || {
      score: 0,
      maximumMarks: 0,
      percentage: 0,
      passed: false,
      correctCount: 0,
      incorrectCount: 0,
      unansweredCount: questions.length,
    };

    return {
      attempt: {
        id: attempt._id.toString(),
        examId: attempt.examId.toString(),
        examTitle: attempt.snapshot.title,
        subjectName: subject?.name || "",
        candidateId: attempt.userId.toString(),
        candidateName: user?.name || "Unknown Candidate",
        candidateEmail: user?.email || "Unknown Email",
        sequenceNumber: attempt.sequenceNumber,
        status: attempt.status,
        score: res.score,
        maximumMarks: res.maximumMarks,
        percentage: res.percentage,
        passed: res.passed,
        startedAt: attempt.startedAt.toISOString(),
        submittedAt: attempt.submittedAt?.toISOString(),
      },
      counts: {
        correct: res.correctCount,
        incorrect: res.incorrectCount,
        unanswered: res.unansweredCount,
        total: questions.length,
      },
      questions,
    };
  }
}

export const reportsService = new ReportsService();
