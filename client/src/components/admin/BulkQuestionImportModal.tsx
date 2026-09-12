import React, { useState } from "react";
import { CreateQuestionDto } from "@examcenter/contracts";
import { api } from "../../services/api.js";
import { Modal } from "../ui/Modal.js";
import { Alert } from "../ui/Alert.js";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

interface BulkQuestionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  onSuccess: () => void;
}

interface ParsedQuestionItem {
  isValid: boolean;
  errors: string[];
  dto?: CreateQuestionDto;
  preview: {
    text: string;
    options: string[];
    correctLetter?: string;
    marks: number;
    negativeMarks: number;
    explanation?: string;
  };
}

export const BulkQuestionImportModal: React.FC<BulkQuestionImportModalProps> = ({
  isOpen,
  onClose,
  examId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"csv" | "text">("csv");
  const [csvText, setCsvText] = useState("");
  const [smartText, setSmartText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedQuestionItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'Question,Option A,Option B,Option C,Option D,Correct Option,Marks,Negative Marks,Explanation\n' +
      '"What is the default TCP port for HTTPS?","80","443","8080","22","B","2","0.5","Port 443 is assigned for TLS encrypted HTTP"\n' +
      '"Which protocol provides connection-oriented reliable byte-stream transfer?","TCP","UDP","IP","ICMP","A","2","0","TCP establishes three-way handshake"\n' +
      '"What does ACID stand for in databases?","Atomicity Consistency Isolation Durability","Accuracy Control Indexing Data","Automated Core Integrated Design","Access Control Identifier Domain","A","3","1","Standard transaction properties"\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "examcenter_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Line Parser handling quotes
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Parse CSV Content
  const handleParseCSV = (rawContent: string) => {
    setImportError(null);
    const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setParsedItems([]);
      return;
    }

    // Skip header if first line looks like header
    const firstLineLower = lines[0].toLowerCase();
    const startIndex = firstLineLower.includes("question") || firstLineLower.includes("option") ? 1 : 0;

    const items: ParsedQuestionItem[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 3) continue;

      const qText = cols[0] || "";
      const optA = cols[1] || "";
      const optB = cols[2] || "";
      const optC = cols[3] || "";
      const optD = cols[4] || "";
      const correctStr = (cols[5] || "").toUpperCase().trim();
      const marks = parseFloat(cols[6]) || 1;
      const negativeMarks = parseFloat(cols[7]) || 0;
      const explanation = cols[8] || undefined;

      const optionsRaw = [optA, optB, optC, optD].filter(Boolean);
      const errors: string[] = [];

      if (!qText.trim()) errors.push("Question statement is empty");
      if (optionsRaw.length < 2) errors.push("Question must have at least 2 options");

      // Check duplicates
      const uniqueOpts = new Set(optionsRaw.map((o) => o.toLowerCase()));
      if (uniqueOpts.size !== optionsRaw.length) errors.push("Duplicate option texts are not allowed");

      // Map correct answer (e.g. 'A', 'B', 'C', 'D', '1', '2' or exact text)
      let correctIdx = -1;
      if (["A", "B", "C", "D"].includes(correctStr)) {
        correctIdx = correctStr.charCodeAt(0) - 65;
      } else if (["1", "2", "3", "4"].includes(correctStr)) {
        correctIdx = parseInt(correctStr, 10) - 1;
      } else {
        correctIdx = optionsRaw.findIndex((o) => o.toLowerCase() === correctStr.toLowerCase());
      }

      if (correctIdx < 0 || correctIdx >= optionsRaw.length) {
        errors.push(`Invalid correct answer indicator "${cols[5]}". Specify A, B, C, or D.`);
      }

      if (negativeMarks > marks) {
        errors.push("Negative marks cannot exceed positive marks");
      }

      const options = optionsRaw.map((text, idx) => ({
        id: `opt_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        text,
      }));

      const correctOptionId = correctIdx >= 0 && correctIdx < options.length ? options[correctIdx].id : "";

      const isValid = errors.length === 0;

      items.push({
        isValid,
        errors,
        dto: isValid
          ? {
              text: qText,
              type: "single_choice",
              options,
              correctOptionId,
              marks,
              negativeMarks,
              explanation,
            }
          : undefined,
        preview: {
          text: qText,
          options: optionsRaw,
          correctLetter: correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : undefined,
          marks,
          negativeMarks,
          explanation,
        },
      });
    }

    setParsedItems(items);
  };

  // Parse Smart Text Content
  const handleParseSmartText = (rawContent: string) => {
    setImportError(null);
    const blocks = rawContent.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const items: ParsedQuestionItem[] = [];

    for (const block of blocks) {
      const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let qText = "";
      const rawOptions: { letter: string; text: string }[] = [];
      let correctLetter: string | undefined = undefined;
      let marks = 1;
      let negativeMarks = 0;
      let explanation: string | undefined = undefined;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if Answer line
        const ansMatch = line.match(/^(?:Answer|Ans|Correct|Correct Answer)\s*[:=-]\s*([A-Fa-f1-6])/i);
        if (ansMatch) {
          correctLetter = ansMatch[1].toUpperCase();
          continue;
        }

        // Check if Marks line
        const marksMatch = line.match(/^(?:Marks|Points|Weight)\s*[:=-]\s*([0-9.]+)/i);
        if (marksMatch) {
          marks = parseFloat(marksMatch[1]) || 1;
          continue;
        }

        // Check if Negative Marks line
        const negMatch = line.match(/^(?:Negative|Penalty|Neg)\s*[:=-]\s*([0-9.]+)/i);
        if (negMatch) {
          negativeMarks = parseFloat(negMatch[1]) || 0;
          continue;
        }

        // Check if Explanation line
        const expMatch = line.match(/^(?:Explanation|Exp|Reason)\s*[:=-]\s*(.+)/i);
        if (expMatch) {
          explanation = expMatch[1].trim();
          continue;
        }

        // Check if Option line (e.g., A) ..., *B) ..., 1) ...)
        const optMatch = line.match(/^(\*?)\s*([A-Fa-f1-6])[\.\)]\s+(.+)$/);
        if (optMatch) {
          const isStarred = optMatch[1] === "*";
          const letter = optMatch[2].toUpperCase();
          const optText = optMatch[3].trim();
          rawOptions.push({ letter, text: optText });
          if (isStarred) {
            correctLetter = letter;
          }
          continue;
        }

        // Otherwise, it's question text (strip leading '1. ' or 'Q1: ')
        if (!qText) {
          qText = line.replace(/^(?:Q\d+[:.]|\d+[:.)])\s*/i, "").trim();
        } else {
          qText += " " + line;
        }
      }

      const errors: string[] = [];
      if (!qText.trim()) errors.push("Question statement missing");
      if (rawOptions.length < 2) errors.push("At least 2 options required");
      if (rawOptions.length > 6) errors.push("Maximum 6 options allowed");

      const uniqueOpts = new Set(rawOptions.map((o) => o.text.toLowerCase()));
      if (uniqueOpts.size !== rawOptions.length) errors.push("Duplicate option texts found");

      let correctIdx = -1;
      if (correctLetter) {
        correctIdx = rawOptions.findIndex((o) => o.letter === correctLetter);
      }

      if (correctIdx < 0) {
        errors.push("Missing or invalid correct answer indicator (e.g. 'Answer: B')");
      }

      if (negativeMarks > marks) {
        errors.push("Negative marks cannot exceed positive marks");
      }

      const options = rawOptions.map((o, idx) => ({
        id: `opt_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        text: o.text,
      }));

      const correctOptionId = correctIdx >= 0 && correctIdx < options.length ? options[correctIdx].id : "";
      const isValid = errors.length === 0;

      items.push({
        isValid,
        errors,
        dto: isValid
          ? {
              text: qText,
              type: "single_choice",
              options,
              correctOptionId,
              marks,
              negativeMarks,
              explanation,
            }
          : undefined,
        preview: {
          text: qText,
          options: rawOptions.map((o) => o.text),
          correctLetter,
          marks,
          negativeMarks,
          explanation,
        },
      });
    }

    setParsedItems(items);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      handleParseCSV(content);
    };
    reader.readAsText(file);
  };

  // Execute Bulk Import
  const handleExecuteImport = async () => {
    const validDtos = parsedItems.filter((i) => i.isValid && i.dto).map((i) => i.dto!);
    if (validDtos.length === 0) {
      alert("No valid questions to import.");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      await api.questions.bulkCreateQuestions(examId, validDtos);
      onSuccess();
      onClose();
    } catch (err: any) {
      setImportError(err.message || "Failed to import questions");
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedItems.filter((i) => i.isValid).length;
  const invalidCount = parsedItems.length - validCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Questions"
      size="large"
      footer={
        <>
          <button onClick={onClose} className="btn btn-secondary" disabled={isImporting}>
            Cancel
          </button>
          <button
            onClick={handleExecuteImport}
            className="btn btn-primary"
            disabled={isImporting || validCount === 0}
          >
            {isImporting ? (
              <>
                <span className="spinner" /> Importing...
              </>
            ) : (
              <>
                <Upload size={16} /> Import {validCount} Question{validCount === 1 ? "" : "s"}
              </>
            )}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {importError && <Alert type="danger" message={importError} />}

        {/* Mode Switcher */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("csv")}
            className={`btn btn-sm ${activeTab === "csv" ? "btn-primary" : "btn-ghost"}`}
          >
            <FileSpreadsheet size={16} /> CSV Spreadsheet Upload
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`btn btn-sm ${activeTab === "text" ? "btn-primary" : "btn-ghost"}`}
          >
            <FileText size={16} /> Smart Text Paste
          </button>
        </div>

        {/* Tab 1: CSV Input */}
        {activeTab === "csv" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Upload a CSV spreadsheet or paste comma-separated values.
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="btn btn-outline btn-sm"
              >
                <Download size={14} /> Download CSV Template
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                style={{ fontSize: "0.875rem" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Or Paste CSV Text:</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  handleParseCSV(e.target.value);
                }}
                placeholder='"Question","Option A","Option B","Option C","Option D","Correct Option","Marks","Negative Marks","Explanation"'
                style={{ fontFamily: "monospace", fontSize: "0.825rem" }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Smart Text Input */}
        {activeTab === "text" && (
          <div>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
              Paste formatted questions directly from Word, Notepad, or Google Docs. Separate each question with a blank line.
            </p>

            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={6}
                value={smartText}
                onChange={(e) => {
                  setSmartText(e.target.value);
                  handleParseSmartText(e.target.value);
                }}
                placeholder={
                  "1. What is the default port for HTTPS?\nA) 80\nB) 443\nC) 22\nD) 8080\nAnswer: B\nMarks: 2\nExplanation: Port 443 is standard for TLS.\n\n2. Which protocol is connection-oriented?\nA) TCP\nB) UDP\nAnswer: A"
                }
                style={{ fontFamily: "monospace", fontSize: "0.85rem", lineHeight: "1.5" }}
              />
            </div>
          </div>
        )}

        {/* Validation Summary Bar */}
        {parsedItems.length > 0 && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: invalidCount > 0 ? "var(--color-warning-light)" : "var(--color-success-light)",
              border: `1px solid ${invalidCount > 0 ? "var(--color-warning-border)" : "var(--color-success-border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {invalidCount > 0 ? (
                <AlertTriangle size={18} color="var(--color-warning-text)" />
              ) : (
                <CheckCircle2 size={18} color="var(--color-success-text)" />
              )}
              <span>
                <strong>{validCount}</strong> question{validCount === 1 ? "" : "s"} ready to import.
                {invalidCount > 0 && (
                  <span style={{ color: "var(--color-danger)", marginLeft: "0.5rem" }}>
                    ({invalidCount} question{invalidCount === 1 ? "" : "s"} have validation errors and will be skipped)
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Live Preview List */}
        {parsedItems.length > 0 && (
          <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <table className="data-table" style={{ fontSize: "0.825rem" }}>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Question Preview</th>
                  <th>Options</th>
                  <th style={{ width: "80px" }}>Key</th>
                  <th style={{ width: "70px" }}>Marks</th>
                  <th style={{ width: "100px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: item.isValid ? "transparent" : "var(--color-danger-light)" }}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: "600", maxWidth: "240px" }}>
                      <div>{item.preview.text}</div>
                      {item.preview.explanation && (
                        <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "400" }}>
                          Exp: {item.preview.explanation}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        {item.preview.options.map((opt, oIdx) => (
                          <span
                            key={oIdx}
                            className={`badge ${
                              item.preview.correctLetter === String.fromCharCode(65 + oIdx)
                                ? "badge-success"
                                : "badge-muted"
                            }`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {String.fromCharCode(65 + oIdx)}: {opt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: "700" }}>
                      {item.preview.correctLetter || "—"}
                    </td>
                    <td>
                      +{item.preview.marks} / -{item.preview.negativeMarks}
                    </td>
                    <td>
                      {item.isValid ? (
                        <span className="badge badge-success">Valid</span>
                      ) : (
                        <span
                          className="badge badge-danger"
                          title={item.errors.join(", ")}
                          style={{ cursor: "help" }}
                        >
                          Error ({item.errors.length})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
