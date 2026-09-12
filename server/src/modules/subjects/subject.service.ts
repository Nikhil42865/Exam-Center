import { CreateSubjectDto, UpdateSubjectDto, SubjectDto } from "@examcenter/contracts";
import { SubjectModel } from "./subject.model.js";
import { ExamModel } from "../exams/exam.model.js";
import { AppError } from "../../shared/errors.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class SubjectService {
  async createSubject(data: CreateSubjectDto, userId: string): Promise<SubjectDto> {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    const existing = await SubjectModel.findOne({
      $or: [{ slug }, { name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") } }],
    });

    if (existing) {
      throw AppError.conflict("A subject with this name or slug already exists");
    }

    const subject = await SubjectModel.create({
      name: data.name.trim(),
      slug,
      description: data.description,
      isActive: data.isActive ?? true,
      createdBy: userId,
    });

    return subject.toDto(0);
  }

  async updateSubject(id: string, data: UpdateSubjectDto): Promise<SubjectDto> {
    const subject = await SubjectModel.findById(id);
    if (!subject) {
      throw AppError.notFound("Subject not found");
    }

    if (data.name && data.name.trim() !== subject.name) {
      const duplicate = await SubjectModel.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
      });
      if (duplicate) {
        throw AppError.conflict("Another subject with this name already exists");
      }
      subject.name = data.name.trim();
    }

    if (data.slug && data.slug !== subject.slug) {
      const targetSlug = slugify(data.slug);
      const duplicateSlug = await SubjectModel.findOne({
        _id: { $ne: id },
        slug: targetSlug,
      });
      if (duplicateSlug) {
        throw AppError.conflict("Another subject with this slug already exists");
      }
      subject.slug = targetSlug;
    }

    if (data.description !== undefined) {
      subject.description = data.description;
    }

    if (data.isActive !== undefined) {
      subject.isActive = data.isActive;
    }

    await subject.save();
    const examCount = await ExamModel.countDocuments({ subjectId: subject._id });
    return subject.toDto(examCount);
  }

  async getAllForAdmin(): Promise<SubjectDto[]> {
    const subjects = await SubjectModel.find().sort({ name: 1 });
    const dtos = await Promise.all(
      subjects.map(async (s) => {
        const examCount = await ExamModel.countDocuments({ subjectId: s._id });
        return s.toDto(examCount);
      })
    );
    return dtos;
  }

  async getActiveForCandidates(): Promise<SubjectDto[]> {
    const subjects = await SubjectModel.find({ isActive: true }).sort({ name: 1 });
    const results: SubjectDto[] = [];

    for (const s of subjects) {
      const publishedCount = await ExamModel.countDocuments({
        subjectId: s._id,
        status: "published",
      });
      // FR-SUB-03: Candidate MUST see only active subjects containing at least one visible exam
      if (publishedCount > 0) {
        results.push(s.toDto(publishedCount));
      }
    }

    return results;
  }

  async deleteOrDeactivate(id: string): Promise<{ action: "deleted" | "deactivated"; subject: SubjectDto }> {
    const subject = await SubjectModel.findById(id);
    if (!subject) {
      throw AppError.notFound("Subject not found");
    }

    const examCount = await ExamModel.countDocuments({ subjectId: id });
    if (examCount > 0) {
      // FR-SUB-04: A subject referenced by exams MUST NOT be hard-deleted. Deactivate instead.
      subject.isActive = false;
      await subject.save();
      return { action: "deactivated", subject: subject.toDto(examCount) };
    }

    await SubjectModel.findByIdAndDelete(id);
    return { action: "deleted", subject: subject.toDto(0) };
  }
}

export const subjectService = new SubjectService();
