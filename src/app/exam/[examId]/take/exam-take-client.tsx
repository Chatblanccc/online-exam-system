"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type ExamQuestion = {
  id: string;
  order: number;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  points: number;
  content: string | null;
};

type ExamPayload = {
  id: string;
  title: string;
  filePath: string;
  duration: number;
  totalScore: number;
  questions: ExamQuestion[];
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
};

export default function ExamTakeClient({ exam }: { exam: ExamPayload }) {
  const router = useRouter();
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(640);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(exam.duration * 60);

  const storageKey = `exam-${exam.id}-answers`;
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") {
      return {};
    }
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return {};
    }
    try {
      return JSON.parse(stored) as Record<string, string>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(answers));
    }, 60000);
    return () => window.clearInterval(interval);
  }, [answers, storageKey]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById("pdf-container");
      if (container) {
        setPageWidth(container.clientWidth - 40); // 40px padding
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) {
      return;
    }
    setSubmitting(true);

    const payload = {
      answers: exam.questions.map((question) => ({
        questionId: question.id,
        answerValue: answers[question.id] ?? "",
      })),
    };

    const response = await fetch(`/api/exams/${exam.id}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (response.status === 409) {
      toast.info("你已提交过该试卷。");
      router.push("/exam");
      return;
    }
    if (!response.ok) {
      toast.error("提交失败，请稍后再试。");
      return;
    }

    toast.success("试卷已提交。");
    setSubmitted(true);
    window.localStorage.removeItem(storageKey);
    router.push("/exam");
  }, [
    answers,
    exam.id,
    exam.questions,
    router,
    storageKey,
    submitted,
    submitting,
  ]);

  useEffect(() => {
    if (secondsLeft === 0 && !submitted) {
      void handleSubmit();
    }
  }, [handleSubmit, secondsLeft, submitted]);

  const totalSeconds = exam.duration * 60;
  const progress = totalSeconds
    ? Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)
    : 0;

  const isPdf = exam.filePath.toLowerCase().endsWith(".pdf");

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-8rem)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
      {/* Left Column: Exam Paper */}
      <div className="h-full flex flex-col overflow-hidden">
        <Card className="flex-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 shadow-sm overflow-hidden flex flex-col" id="pdf-container">
          <div className="flex-shrink-0 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--shell-ink)] truncate">
                {exam.title}
              </h2>
              <p className="text-sm text-[var(--shell-muted)]">试卷预览</p>
            </div>
          </div>
          <Progress value={progress} className="mb-4 lg:hidden" />
          
          <div className="flex-1 overflow-y-auto min-h-0 bg-zinc-50/50 rounded-lg border border-dashed p-4 flex flex-col items-center">
             {isPdf ? (
                <>
                  <Document
                    file={exam.filePath}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    loading={<div className="text-sm text-muted-foreground my-10">加载试卷中...</div>}
                    error={<div className="text-sm text-red-500 my-10">试卷加载失败</div>}
                  >
                    <Page 
                        pageNumber={pageNumber} 
                        width={pageWidth} 
                        className="shadow-lg mb-4"
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                  </Document>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 h-full text-sm text-[var(--shell-muted)]">
                  <p>当前试卷为 Word 文档，请下载查看。</p>
                  <a
                    className="text-sm font-medium text-[var(--shell-ink)] underline-offset-4 hover:underline"
                    href={exam.filePath}
                    target="_blank"
                    rel="noreferrer"
                  >
                    下载试卷
                  </a>
                </div>
              )}
          </div>
          
          {isPdf && (
             <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                >
                  上一页
                </Button>
                <span className="text-sm text-[var(--shell-muted)]">
                  第 {pageNumber} / {numPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNumber >= numPages}
                  onClick={() =>
                    setPageNumber((prev) => Math.min(prev + 1, numPages))
                  }
                >
                  下一页
                </Button>
              </div>
          )}
        </Card>
      </div>

      {/* Right Column: Answer Sheet */}
      <div className="h-full flex flex-col overflow-hidden">
        <Card className="flex-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 shadow-sm flex flex-col overflow-hidden">
            <div className="flex-shrink-0 mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-[var(--shell-ink)]">
                    答题卡
                    </h3>
                    <p className="text-sm text-[var(--shell-muted)]">
                    {exam.questions.length} 道题 · 总分 {exam.totalScore}
                    </p>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="hidden lg:block text-right">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">剩余时间</p>
                        <p className="font-mono text-xl font-bold">{formatTime(secondsLeft)}</p>
                    </div>
                    <Badge
                        variant="outline"
                        className="hidden md:inline-flex border-[var(--shell-border)] bg-[var(--shell-accent-soft)] text-[var(--shell-ink)]"
                    >
                        自动保存中
                    </Badge>
                 </div>
            </div>
            
            <div className="lg:hidden mb-4 flex-shrink-0">
                    <Progress value={progress} />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {exam.questions.map((question) => (
                <div
                key={question.id}
                className="rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4 transition-colors hover:border-primary/20"
                >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                        {question.order}
                    </span>
                    <span className="text-xs text-[var(--shell-muted)]">
                    {question.points} 分
                    </span>
                </div>
                {question.content ? (
                    <p className="mb-3 text-sm text-[var(--shell-ink)]">
                    {question.content}
                    </p>
                ) : null}
                <div className="min-h-10 flex items-center">
                    {question.type === "SHORT_ANSWER" ? (
                      <Textarea
                          value={answers[question.id] ?? ""}
                          onChange={(event) =>
                          setAnswers((prev) => ({
                              ...prev,
                              [question.id]: event.target.value,
                          }))
                          }
                          placeholder="请输入答案..."
                          className="resize-none bg-background border-muted/20 focus:border-primary/30"
                          rows={3}
                      />
                    ) : question.type === "SINGLE_CHOICE" ? (
                      <Select
                        value={answers[question.id] ?? ""}
                        onValueChange={(value) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full bg-background border-muted/20">
                          <SelectValue placeholder="选择答案" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A", "B", "C", "D"].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              选项 {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : question.type === "TRUE_FALSE" ? (
                      <Select
                        value={answers[question.id] ?? ""}
                        onValueChange={(value) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full bg-background border-muted/20">
                          <SelectValue placeholder="选择答案" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="√">√ 正确</SelectItem>
                          <SelectItem value="×">× 错误</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : question.type === "MULTIPLE_CHOICE" ? (
                      <div className="w-full flex flex-col gap-2">
                         <ToggleGroup
                            type="multiple"
                            variant="outline"
                            className="justify-start gap-2"
                            value={(answers[question.id] ?? "").split("").filter(Boolean)}
                            onValueChange={(vals) => {
                                // 保持字母顺序
                                const sorted = vals.sort().join("");
                                setAnswers((prev) => ({
                                    ...prev,
                                    [question.id]: sorted,
                                }));
                            }}
                        >
                            {["A", "B", "C", "D"].map((opt) => (
                                <ToggleGroupItem 
                                    key={opt} 
                                    value={opt} 
                                    className="w-10 h-10 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                >
                                    {opt}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        <p className="text-[10px] text-muted-foreground ml-1">
                          已选: {answers[question.id] || "无"}
                        </p>
                      </div>
                    ) : (
                      <Input
                          value={answers[question.id] ?? ""}
                          onChange={(event) =>
                          setAnswers((prev) => ({
                              ...prev,
                              [question.id]: event.target.value,
                          }))
                          }
                          placeholder="请输入答案"
                          className="bg-background border-muted/20"
                      />
                    )}
                </div>
                </div>
            ))}
            </div>

            <div className="flex-shrink-0 mt-6 pt-4 border-t flex flex-col sm:flex-row gap-3">
                <Button disabled={submitting || submitted} onClick={handleSubmit} className="flex-1">
                    {submitting ? "提交中..." : "提交试卷"}
                </Button>
                 <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                    window.localStorage.setItem(storageKey, JSON.stringify(answers))
                    }
                >
                    手动保存
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
}
