"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("./config/db.js");
const user_model_js_1 = require("./modules/users/user.model.js");
const subject_model_js_1 = require("./modules/subjects/subject.model.js");
const exam_model_js_1 = require("./modules/exams/exam.model.js");
const question_model_js_1 = require("./modules/questions/question.model.js");
const logger_js_1 = require("./shared/logger.js");
async function seedDemo() {
    await (0, db_js_1.connectDatabase)();
    const admin = await user_model_js_1.UserModel.findOne({ role: "admin" });
    if (!admin) {
        logger_js_1.logger.error("Admin user must be seeded first!");
        process.exit(1);
    }
    // 1. Seed Subjects
    let netSubject = await subject_model_js_1.SubjectModel.findOne({ slug: "computer-networks" });
    if (!netSubject) {
        netSubject = await subject_model_js_1.SubjectModel.create({
            name: "Computer Networks",
            slug: "computer-networks",
            description: "Data communications, protocols, architecture, routing, and network security.",
            isActive: true,
            createdBy: admin._id,
        });
        logger_js_1.logger.info("Created subject: Computer Networks");
    }
    let dbSubject = await subject_model_js_1.SubjectModel.findOne({ slug: "database-systems" });
    if (!dbSubject) {
        dbSubject = await subject_model_js_1.SubjectModel.create({
            name: "Database Systems",
            slug: "database-systems",
            description: "Relational database concepts, SQL queries, normalization, and ACID properties.",
            isActive: true,
            createdBy: admin._id,
        });
        logger_js_1.logger.info("Created subject: Database Systems");
    }
    // 2. Seed Exams
    let netExam = await exam_model_js_1.ExamModel.findOne({ slug: "computer-networks-fundamentals" });
    if (!netExam) {
        netExam = await exam_model_js_1.ExamModel.create({
            subjectId: netSubject._id,
            title: "Computer Networks Fundamentals",
            slug: "computer-networks-fundamentals",
            description: "Standardized objective test covering OSI layers, TCP/IP protocol suite, and IPv4 addressing.",
            instructions: "1. This exam contains 3 multiple-choice questions.\n2. Total duration is 10 minutes.\n3. Negative marking applies to incorrect answers.\n4. Passing score is 60%.\n5. Click Submit once finished.",
            durationMinutes: 10,
            passingPercentage: 60,
            attemptLimit: 3,
            shuffleQuestions: true,
            shuffleOptions: false,
            showScoreAfterSubmit: true,
            showAnswersAfterSubmit: true,
            status: "published",
            version: 1,
            questionCount: 3,
            totalMarks: 6,
            createdBy: admin._id,
            publishedAt: new Date(),
        });
        // Create Questions for netExam
        await question_model_js_1.QuestionModel.create([
            {
                examId: netExam._id,
                text: "Which protocol operates at the Transport Layer of the OSI Model and provides reliable, connection-oriented data transfer?",
                type: "single_choice",
                options: [
                    { id: "opt_tcp", text: "TCP (Transmission Control Protocol)" },
                    { id: "opt_udp", text: "UDP (User Datagram Protocol)" },
                    { id: "opt_ip", text: "IP (Internet Protocol)" },
                    { id: "opt_icmp", text: "ICMP (Internet Control Message Protocol)" },
                ],
                correctOptionId: "opt_tcp",
                explanation: "TCP provides reliable, sequenced, connection-oriented byte-stream delivery with flow control and retransmissions.",
                marks: 2,
                negativeMarks: 0.5,
                order: 1,
            },
            {
                examId: netExam._id,
                text: "What is the default TCP port number used for secure web browsing (HTTPS)?",
                type: "single_choice",
                options: [
                    { id: "opt_80", text: "Port 80" },
                    { id: "opt_443", text: "Port 443" },
                    { id: "opt_8080", text: "Port 8080" },
                    { id: "opt_22", text: "Port 22" },
                ],
                correctOptionId: "opt_443",
                explanation: "Port 443 is the standard default port for HTTP traffic encrypted by Transport Layer Security (TLS).",
                marks: 2,
                negativeMarks: 0,
                order: 2,
            },
            {
                examId: netExam._id,
                text: "Which IPv4 address belongs to the private address space defined by RFC 1918?",
                type: "single_choice",
                options: [
                    { id: "opt_priv", text: "172.16.25.1" },
                    { id: "opt_pub1", text: "8.8.8.8" },
                    { id: "opt_pub2", text: "1.1.1.1" },
                    { id: "opt_pub3", text: "198.51.100.2" },
                ],
                correctOptionId: "opt_priv",
                explanation: "RFC 1918 reserves 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 for private internets.",
                marks: 2,
                negativeMarks: 0.5,
                order: 3,
            },
        ]);
        logger_js_1.logger.info("Created exam: Computer Networks Fundamentals with 3 questions");
    }
    let dbExam = await exam_model_js_1.ExamModel.findOne({ slug: "sql-relational-databases-assessment" });
    if (!dbExam) {
        dbExam = await exam_model_js_1.ExamModel.create({
            subjectId: dbSubject._id,
            title: "SQL & Relational Databases Assessment",
            slug: "sql-relational-databases-assessment",
            description: "Assess your understanding of primary keys, constraints, and ACID properties.",
            instructions: "Answer all questions. Each correct answer awards points. Unanswered questions do not incur penalties.",
            durationMinutes: 15,
            passingPercentage: 50,
            attemptLimit: 2,
            shuffleQuestions: false,
            shuffleOptions: true,
            showScoreAfterSubmit: true,
            showAnswersAfterSubmit: true,
            status: "published",
            version: 1,
            questionCount: 2,
            totalMarks: 6,
            createdBy: admin._id,
            publishedAt: new Date(),
        });
        await question_model_js_1.QuestionModel.create([
            {
                examId: dbExam._id,
                text: "In SQL, which constraint uniquely identifies each record and strictly disallows NULL values?",
                type: "single_choice",
                options: [
                    { id: "opt_pk", text: "PRIMARY KEY" },
                    { id: "opt_uniq", text: "UNIQUE" },
                    { id: "opt_fk", text: "FOREIGN KEY" },
                    { id: "opt_chk", text: "CHECK" },
                ],
                correctOptionId: "opt_pk",
                explanation: "PRIMARY KEY enforces both uniqueness and NOT NULL on the specified columns.",
                marks: 3,
                negativeMarks: 1,
                order: 1,
            },
            {
                examId: dbExam._id,
                text: "Which ACID property ensures that committed transactions remain permanent even during system power failures?",
                type: "single_choice",
                options: [
                    { id: "opt_atom", text: "Atomicity" },
                    { id: "opt_cons", text: "Consistency" },
                    { id: "opt_iso", text: "Isolation" },
                    { id: "opt_dur", text: "Durability" },
                ],
                correctOptionId: "opt_dur",
                explanation: "Durability guarantees that once a transaction has been committed, it will survive any crash or power outage.",
                marks: 3,
                negativeMarks: 0,
                order: 2,
            },
        ]);
        logger_js_1.logger.info("Created exam: SQL & Relational Databases Assessment with 2 questions");
    }
    logger_js_1.logger.info("✅ Demo data seeded successfully!");
    await (0, db_js_1.disconnectDatabase)();
}
seedDemo().catch((err) => {
    logger_js_1.logger.error({ err }, "Demo seed failed:");
    process.exit(1);
});
