"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectService = exports.SubjectService = void 0;
const subject_model_js_1 = require("./subject.model.js");
const exam_model_js_1 = require("../exams/exam.model.js");
const errors_js_1 = require("../../shared/errors.js");
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
class SubjectService {
    async createSubject(data, userId) {
        const slug = data.slug ? slugify(data.slug) : slugify(data.name);
        const existing = await subject_model_js_1.SubjectModel.findOne({
            $or: [{ slug }, { name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") } }],
        });
        if (existing) {
            throw errors_js_1.AppError.conflict("A subject with this name or slug already exists");
        }
        const subject = await subject_model_js_1.SubjectModel.create({
            name: data.name.trim(),
            slug,
            description: data.description,
            isActive: data.isActive ?? true,
            createdBy: userId,
        });
        return subject.toDto(0);
    }
    async updateSubject(id, data) {
        const subject = await subject_model_js_1.SubjectModel.findById(id);
        if (!subject) {
            throw errors_js_1.AppError.notFound("Subject not found");
        }
        if (data.name && data.name.trim() !== subject.name) {
            const duplicate = await subject_model_js_1.SubjectModel.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
            });
            if (duplicate) {
                throw errors_js_1.AppError.conflict("Another subject with this name already exists");
            }
            subject.name = data.name.trim();
        }
        if (data.slug && data.slug !== subject.slug) {
            const targetSlug = slugify(data.slug);
            const duplicateSlug = await subject_model_js_1.SubjectModel.findOne({
                _id: { $ne: id },
                slug: targetSlug,
            });
            if (duplicateSlug) {
                throw errors_js_1.AppError.conflict("Another subject with this slug already exists");
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
        const examCount = await exam_model_js_1.ExamModel.countDocuments({ subjectId: subject._id });
        return subject.toDto(examCount);
    }
    async getAllForAdmin() {
        const subjects = await subject_model_js_1.SubjectModel.find().sort({ name: 1 });
        const dtos = await Promise.all(subjects.map(async (s) => {
            const examCount = await exam_model_js_1.ExamModel.countDocuments({ subjectId: s._id });
            return s.toDto(examCount);
        }));
        return dtos;
    }
    async getActiveForCandidates() {
        const subjects = await subject_model_js_1.SubjectModel.find({ isActive: true }).sort({ name: 1 });
        const results = [];
        for (const s of subjects) {
            const publishedCount = await exam_model_js_1.ExamModel.countDocuments({
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
    async deleteOrDeactivate(id) {
        const subject = await subject_model_js_1.SubjectModel.findById(id);
        if (!subject) {
            throw errors_js_1.AppError.notFound("Subject not found");
        }
        const examCount = await exam_model_js_1.ExamModel.countDocuments({ subjectId: id });
        if (examCount > 0) {
            // FR-SUB-04: A subject referenced by exams MUST NOT be hard-deleted. Deactivate instead.
            subject.isActive = false;
            await subject.save();
            return { action: "deactivated", subject: subject.toDto(examCount) };
        }
        await subject_model_js_1.SubjectModel.findByIdAndDelete(id);
        return { action: "deleted", subject: subject.toDto(0) };
    }
}
exports.SubjectService = SubjectService;
exports.subjectService = new SubjectService();
