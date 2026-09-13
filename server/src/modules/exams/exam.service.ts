import { CreateExamDto, UpdateExamDto, ExamDto, CandidateExamDto, AdminQuestionDto } from "@examcenter/contracts";
import { ExamModel, IExam } from "./exam.model.js";
import { SubjectModel } from "../subjects/subject.model.js";
import { QuestionModel } from "../questions/question.model.js";
import { AttemptModel } from "../attempts/attempt.model.js";
import { AppError } from "../../shared/errors.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class ExamService {
  async createExam(data: CreateExamDto, userId: string): Promise<ExamDto> {
    const subject = await SubjectModel.findById(data.subjectId);
    if (!subject) {
      throw AppError.notFound("Subject not found");
    }

    let slug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!slug) {
      slug = `exam-${Date.now()}`;
    }

    if (data.slug) {
      const existing = await ExamModel.findOne({ slug });
      if (existing) {
        throw AppError.conflict(`An exam with the slug '${slug}' already exists. Please choose a different slug.`);
      }
    } else {
      let uniqueSlug = slug;
      let counter = 1;
      while (await ExamModel.findOne({ slug: uniqueSlug })) {
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
      slug = uniqueSlug;
    }

    const exam = await ExamModel.create({
      ...data,
      slug,
      status: "draft",
      version: 1,
      questionCount: 0,
      totalMarks: 0,
      createdBy: userId,
    });

    return exam.toDto(subject.name);
  }

  async updateExam(id: string, data: UpdateExamDto): Promise<ExamDto> {
    const exam = await ExamModel.findById(id);
    if (!exam) {
      throw AppError.notFound("Exam not found");
    }

    if (exam.status === "archived") {
      throw AppError.badRequest("Cannot edit an archived exam");
    }

    if (data.title && data.title !== exam.title) {
      exam.title = data.title;
    }

    if (data.slug && data.slug !== exam.slug) {
      const newSlug = slugify(data.slug);
      const duplicate = await ExamModel.findOne({ _id: { $ne: id }, slug: newSlug });
      if (duplicate) {
        throw AppError.conflict("An exam with this slug already exists");
      }
      exam.slug = newSlug;
    }

    if (data.subjectId && data.subjectId !== exam.subjectId.toString()) {
      const subject = await SubjectModel.findById(data.subjectId);
      if (!subject) throw AppError.notFound("Subject not found");
      exam.subjectId = subject._id as any;
    }

    if (data.description !== undefined) exam.description = data.description;
    if (data.instructions !== undefined) exam.instructions = data.instructions;
    if (data.durationMinutes !== undefined) exam.durationMinutes = data.durationMinutes;
    if (data.passingPercentage !== undefined) exam.passingPercentage = data.passingPercentage;
    if (data.attemptLimit !== undefined) exam.attemptLimit = data.attemptLimit;
    if (data.availableFrom !== undefined) exam.availableFrom = data.availableFrom ? new Date(data.availableFrom) : undefined;
    if (data.availableUntil !== undefined) exam.availableUntil = data.availableUntil ? new Date(data.availableUntil) : undefined;
    if (data.shuffleQuestions !== undefined) exam.shuffleQuestions = data.shuffleQuestions;
    if (data.shuffleOptions !== undefined) exam.shuffleOptions = data.shuffleOptions;
    if (data.showScoreAfterSubmit !== undefined) exam.showScoreAfterSubmit = data.showScoreAfterSubmit;
    if (data.showAnswersAfterSubmit !== undefined) exam.showAnswersAfterSubmit = data.showAnswersAfterSubmit;

    await exam.save();
    const subject = await SubjectModel.findById(exam.subjectId);
    return exam.toDto(subject?.name);
  }

  async publishExam(id: string): Promise<ExamDto> {
    const exam = await ExamModel.findById(id);
    if (!exam) {
      throw AppError.notFound("Exam not found");
    }

    if (exam.status === "published") {
      throw AppError.badRequest("Exam is already published");
    }

    // FR-EXAM-05: Publication MUST fail when an exam has no valid questions
    const questions = await QuestionModel.find({ examId: id });
    if (questions.length === 0) {
      throw AppError.badRequest("Cannot publish an exam with no questions. Please add at least one question.");
    }

    // Validate each question has valid options and valid correctOptionId
    for (const q of questions) {
      if (!q.options || q.options.length < 2 || q.options.length > 6) {
        throw AppError.badRequest(`Question "${q.text.slice(0, 30)}..." must have between 2 and 6 options.`);
      }
      if (!q.options.some((opt) => opt.id === q.correctOptionId)) {
        throw AppError.badRequest(`Question "${q.text.slice(0, 30)}..." has an invalid correct answer.`);
      }
    }

    exam.status = "published";
    exam.publishedAt = new Date();
    exam.questionCount = questions.length;
    exam.totalMarks = Math.round(questions.reduce((sum, q) => sum + q.marks, 0) * 100) / 100;
    await exam.save();

    const subject = await SubjectModel.findById(exam.subjectId);
    return exam.toDto(subject?.name);
  }

  async unpublishExam(id: string): Promise<ExamDto> {
    const exam = await ExamModel.findById(id);
    if (!exam) {
      throw AppError.notFound("Exam not found");
    }

    if (exam.status !== "published") {
      throw AppError.badRequest("Only published exams can be unpublished");
    }

    // Returning to draft safely; increments version for subsequent publication to protect snapshots
    exam.status = "draft";
    exam.version += 1;
    await exam.save();

    const subject = await SubjectModel.findById(exam.subjectId);
    return exam.toDto(subject?.name);
  }

  async archiveExam(id: string): Promise<ExamDto> {
    const exam = await ExamModel.findById(id);
    if (!exam) {
      throw AppError.notFound("Exam not found");
    }

    exam.status = "archived";
    await exam.save();

    const subject = await SubjectModel.findById(exam.subjectId);
    return exam.toDto(subject?.name);
  }

  async getAdminExams(filters: { status?: string; subjectId?: string; search?: string }): Promise<ExamDto[]> {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.search) query.title = { $regex: filters.search, $options: "i" };

    const exams = await ExamModel.find(query).sort({ updatedAt: -1 });
    const subjects = await SubjectModel.find();
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));

    return exams.map((e) => e.toDto(subjectMap.get(e.subjectId.toString())));
  }

  async getAdminExamById(id: string): Promise<ExamDto> {
    const exam = await ExamModel.findById(id);
    if (!exam) throw AppError.notFound("Exam not found");
    const subject = await SubjectModel.findById(exam.subjectId);
    return exam.toDto(subject?.name);
  }

  async getAdminPreview(id: string): Promise<{ exam: ExamDto; questions: AdminQuestionDto[] }> {
    const exam = await ExamModel.findById(id);
    if (!exam) throw AppError.notFound("Exam not found");

    const subject = await SubjectModel.findById(exam.subjectId);
    const questions = await QuestionModel.find({ examId: id }).sort({ order: 1 });

    return {
      exam: exam.toDto(subject?.name),
      questions: questions.map((q) => q.toAdminDto()),
    };
  }

  async getCandidateExams(
    userId: string,
    filters: { subjectId?: string; search?: string }
  ): Promise<CandidateExamDto[]> {
    // 1. Get active subjects
    const activeSubjects = await SubjectModel.find({ isActive: true });
    const activeSubjectIds = activeSubjects.map((s) => s._id.toString());
    const subjectMap = new Map(activeSubjects.map((s) => [s._id.toString(), s.name]));

    // 2. Query published exams belonging to active subjects
    const query: any = {
      status: "published",
      subjectId: { $in: activeSubjectIds },
    };

    if (filters.subjectId && activeSubjectIds.includes(filters.subjectId)) {
      query.subjectId = filters.subjectId;
    }

    if (filters.search) {
      query.title = { $regex: filters.search, $options: "i" };
    }

    const exams = await ExamModel.find(query).sort({ createdAt: -1 });
    const now = new Date();

    const results: CandidateExamDto[] = [];

    for (const exam of exams) {
      // Check attempts used by this candidate
      const attemptsCount = await AttemptModel.countDocuments({
        userId,
        examId: exam._id,
        status: { $in: ["submitted", "expired"] },
      });

      // Check active attempt
      const activeAttempt = await AttemptModel.findOne({
        userId,
        examId: exam._id,
        status: "in_progress",
      });

      let isEligible = true;
      let ineligibilityReason: string | undefined;

      if (exam.availableFrom && now < exam.availableFrom) {
        isEligible = false;
        ineligibilityReason = `Exam will open on ${exam.availableFrom.toLocaleDateString()}`;
      } else if (exam.availableUntil && now > exam.availableUntil) {
        isEligible = false;
        ineligibilityReason = "Exam availability window has ended";
      } else if (attemptsCount >= exam.attemptLimit && !activeAttempt) {
        isEligible = false;
        ineligibilityReason = "Maximum attempt limit reached";
      }

      results.push(
        exam.toCandidateDto({
          subjectName: subjectMap.get(exam.subjectId.toString()),
          attemptsUsed: attemptsCount,
          isEligible,
          ineligibilityReason,
          activeAttemptId: activeAttempt ? activeAttempt._id.toString() : undefined,
        })
      );
    }

    return results;
  }

  async getCandidateExamDetails(id: string, userId: string): Promise<CandidateExamDto> {
    const exam = await ExamModel.findOne({ _id: id, status: "published" });
    if (!exam) {
      throw AppError.notFound("Exam not found or not published");
    }

    const subject = await SubjectModel.findOne({ _id: exam.subjectId, isActive: true });
    if (!subject) {
      throw AppError.notFound("Exam subject is inactive");
    }

    const attemptsCount = await AttemptModel.countDocuments({
      userId,
      examId: id,
      status: { $in: ["submitted", "expired"] },
    });

    const activeAttempt = await AttemptModel.findOne({
      userId,
      examId: id,
      status: "in_progress",
    });

    const now = new Date();
    let isEligible = true;
    let ineligibilityReason: string | undefined;

    if (exam.availableFrom && now < exam.availableFrom) {
      isEligible = false;
      ineligibilityReason = `Exam opens on ${exam.availableFrom.toLocaleString()}`;
    } else if (exam.availableUntil && now > exam.availableUntil) {
      isEligible = false;
      ineligibilityReason = "Exam window has closed";
    } else if (attemptsCount >= exam.attemptLimit && !activeAttempt) {
      isEligible = false;
      ineligibilityReason = "You have exhausted all allowed attempts";
    }

    return exam.toCandidateDto({
      subjectName: subject.name,
      attemptsUsed: attemptsCount,
      isEligible,
      ineligibilityReason,
      activeAttemptId: activeAttempt ? activeAttempt._id.toString() : undefined,
    });
  }
}

export const examService = new ExamService();
