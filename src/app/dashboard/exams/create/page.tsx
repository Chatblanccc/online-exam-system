"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ListPlus, FileText, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuestionForm = {
  id: string;
  order: number;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  points: number;
  content: string;
  correctAnswer: string;
};

const questionTypes = [
  { value: "SINGLE_CHOICE", label: "单选题" },
  { value: "MULTIPLE_CHOICE", label: "多选题" },
  { value: "TRUE_FALSE", label: "判断题" },
  { value: "SHORT_ANSWER", label: "简答题" },
] as const;

const createQuestionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `q-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createQuestion = (order: number): QuestionForm => ({
  id: createQuestionId(),
  order,
  type: "SINGLE_CHOICE",
  points: 5,
  content: "",
  correctAnswer: "",
});

export default function CreateExamPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [totalScore, setTotalScore] = useState(100);
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    createQuestion(1),
  ]);
  const [loading, setLoading] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  const totalPoints = useMemo(
    () => questions.reduce((sum, question) => sum + question.points, 0),
    [questions],
  );
  const scoreDelta = totalScore - totalPoints;

  const updateQuestion = (id: string, updates: Partial<QuestionForm>) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, ...updates } : question,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createQuestion(prev.length + 1)]);
  };

  const handleBatchAdd = () => {
    if (!batchText.trim()) return;

    const lines = batchText.trim().split("\n");
    const newQuestions: QuestionForm[] = [];
    let currentOrder = questions.length + 1;

    lines.forEach((line) => {
      // 检查是否有前置分值定义 (例如 2 | 1. int | 2. if)
      let lineDefaultPoints: number | null = null;
      let processingLine = line.trim();
      const pointsPrefixMatch = processingLine.match(/^(\d+)\s*\|\s*/);
      if (pointsPrefixMatch) {
        lineDefaultPoints = parseInt(pointsPrefixMatch[1]);
        processingLine = processingLine.replace(/^(\d+)\s*\|\s*/, "");
      }

      // 检查是否包含冒号且有空格分隔的答案列表 (例如 1-5: B B C A B)
      const rangeListMatch = processingLine.match(/(\d+)-(\d+):\s*([A-Z|√|×|对|错|\s]+)/gi);
      if (rangeListMatch) {
        rangeListMatch.forEach(segment => {
          const partMatch = segment.match(/(\d+)-(\d+):\s*([A-Z|√|×|对|错|\s]+)/i);
          if (partMatch) {
            const start = parseInt(partMatch[1]);
            const end = parseInt(partMatch[2]);
            const answers = partMatch[3].trim().split(/\s+/);
            
            answers.forEach((ans, idx) => {
              const answer = ans.toUpperCase();
              if (answer && (start + idx <= end)) {
                const type = answer === "√" || answer === "×" || ["对", "错"].includes(answer) ? "TRUE_FALSE" : (answer.length > 1 && !/^[A-Z]+$/.test(answer) ? "SHORT_ANSWER" : (answer.length > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE"));
                
                newQuestions.push({
                  id: createQuestionId(),
                  order: currentOrder++,
                  type,
                  points: lineDefaultPoints ?? (type === "SHORT_ANSWER" ? 4 : 2),
                  content: "",
                  correctAnswer: answer.replace("对", "√").replace("错", "×"),
                });
              }
            });
          }
        });
        return;
      }

      // 检查是否包含分隔符 | (例如 1.A | 2.B 或 1.int | 2.if)
      if (processingLine.includes("|") || processingLine.match(/\d+\.\s*[^|]+/)) {
        const matches = Array.from(processingLine.matchAll(/(\d+)\.?\s*([^|]+)/gi));
        matches.forEach((match) => {
          const rawValue = match[2].trim();
          // 只有全大写的 A-F 且长度不超过 4 才识别为选择题
          const isChoice = /^[A-F]{1,4}$/.test(rawValue);
          const isTrueFalse = /^[√|×|对|错]$/.test(rawValue);
          const type = isTrueFalse ? "TRUE_FALSE" : (isChoice ? (rawValue.length > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE") : "SHORT_ANSWER");
          
          newQuestions.push({
            id: createQuestionId(),
            order: currentOrder++,
            type,
            points: lineDefaultPoints ?? (type === "SHORT_ANSWER" ? 4 : 2),
            content: "", 
            correctAnswer: isChoice || isTrueFalse ? rawValue.toUpperCase().replace("对", "√").replace("错", "×") : rawValue, // 操作题存入答案
          });
        });
        return;
      }

      // 匹配之前的格式: 1. A (5分) 或 1-5 A (每题2分)
      const rangeMatch = line.match(/^(\d+)-(\d+)\s+([A-Z|√|×|对|错]+)(\s+\((\d+)分\))?/i);
      const singleMatch = line.match(/^(\d+)\.?\s+([A-Z|√|×|对|错]+)(\s+\((\d+)分\))?/i);

      if (rangeMatch) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        const answer = rangeMatch[3].toUpperCase();
        const type = answer === "√" || answer === "×" || ["对", "错"].includes(answer) ? "TRUE_FALSE" : (answer.length > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE");
        const points = rangeMatch[5] ? parseInt(rangeMatch[5]) : (lineDefaultPoints ?? (type === "SHORT_ANSWER" ? 4 : 2));

        for (let i = start; i <= end; i++) {
          newQuestions.push({
            id: createQuestionId(),
            order: currentOrder++,
            type,
            points,
            content: "",
            correctAnswer: answer.replace("对", "√").replace("错", "×"),
          });
        }
      } else if (singleMatch) {
        const answer = singleMatch[2].toUpperCase();
        const type = answer === "√" || answer === "×" || ["对", "错"].includes(answer) ? "TRUE_FALSE" : (answer.length > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE");
        const points = singleMatch[4] ? parseInt(singleMatch[4]) : (lineDefaultPoints ?? (type === "SHORT_ANSWER" ? 4 : 2));

        newQuestions.push({
          id: createQuestionId(),
          order: currentOrder++,
          type,
          points,
          content: "",
          correctAnswer: answer.replace("对", "√").replace("错", "×"),
        });
      }
    });

    if (newQuestions.length > 0) {
      setQuestions((prev) => [...prev, ...newQuestions]);
      setBatchText("");
      setShowBatchDialog(false);
      toast.success(`成功批量添加 ${newQuestions.length} 道题目`);
    } else {
      toast.error("未能识别题目格式，请检查输入内容");
    }
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => {
      const next = prev.filter((question) => question.id !== id);
      return next.map((question, index) => ({ ...question, order: index + 1 }));
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error("请上传试卷文件。");
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append("title", title);
    payload.append("duration", String(duration));
    payload.append("totalScore", String(totalScore));
    payload.append("file", file);
    payload.append(
      "questions",
      JSON.stringify(
        questions.map((question) => ({
          order: question.order,
          type: question.type,
          points: question.points,
          content: question.content,
          correctAnswer: question.correctAnswer || null,
        })),
      ),
    );

    const response = await fetch("/api/exams", {
      method: "POST",
      body: payload,
    });

    setLoading(false);

    if (!response.ok) {
      toast.error("创建考试失败，请检查输入内容。");
      return;
    }

    toast.success("考试创建成功。");
    setTitle("");
    setDuration(60);
    setTotalScore(100);
    setFile(null);
    setQuestions([createQuestion(1)]);
  };

  return (
    <div className="space-y-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.36em] text-[var(--shell-muted)]">
          Exam Builder
        </p>
        <h1 className="text-3xl font-semibold text-[var(--shell-ink)]">
          <span className="font-[var(--font-fraunces)]">创建新考试</span>
        </h1>
        <p className="text-sm text-[var(--shell-muted)]">
          设定试卷资料并配置答题卡题型。
        </p>
      </header>

      <form className="space-y-8" onSubmit={onSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card className="border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.4)]">
            <h2 className="text-lg font-semibold text-[var(--shell-ink)]">
              考试基本信息
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="title">考试标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">考试时长 (分钟)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalScore">总分</Label>
                <Input
                  id="totalScore"
                  type="number"
                  min={1}
                  value={totalScore}
                  onChange={(event) => setTotalScore(Number(event.target.value))}
                  required
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="file">试卷文件 (.pdf 或 .docx)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                }}
                required
              />
            </div>
          </Card>

          <Card className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-5 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)]">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--shell-muted)]">
              配置概览
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-[var(--shell-muted)]">题目数量</p>
                <p className="text-2xl font-semibold text-[var(--shell-ink)]">
                  {questions.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--shell-muted)]">题目总分</p>
                <p className="text-2xl font-semibold text-[var(--shell-ink)]">
                  {totalPoints}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3 text-sm text-[var(--shell-muted)]">
                {scoreDelta === 0
                  ? "题目分值与总分一致"
                  : scoreDelta > 0
                    ? `题目分值还差 ${scoreDelta} 分`
                    : `题目分值超出 ${Math.abs(scoreDelta)} 分`}
              </div>
            </div>
          </Card>
        </div>

        <Card className="border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.35)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--shell-ink)]">
                答题卡配置
              </h2>
              <p className="text-sm text-[var(--shell-muted)]">
                选择题和判断题将自动判分，简答题需手动评分。
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <ListPlus className="mr-2 h-4 w-4" /> 批量添加
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>批量添加题目</DialogTitle>
                    <DialogDescription>
                      通过文本格式快速导入题目和答案，每行一个。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Alert variant="secondary" className="bg-muted/50">
                      <Info className="h-4 w-4" />
                      <AlertTitle>格式说明</AlertTitle>
                      <AlertDescription className="text-xs space-y-1">
                        <p>1. 简易列表: <strong>1.A | 2.B | 3.√</strong></p>
                        <p>2. 操作题(提示): <strong>4. int | 5. if | 6. def</strong></p>
                        <p>3. 分值前缀: <strong>5 | 1-10: A B C...</strong> (每题5分)</p>
                        <p>4. 复合范围: <strong>1-5: A B C A B | 6-10: √ × √ √ ×</strong></p>
                      </AlertDescription>
                    </Alert>
                    <Textarea
                      placeholder="例如:
1-10 A (2分)
11-15 √ (2分)
16. B (5分)
17. ABCD (5分)"
                      className="min-h-[300px] font-mono"
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowBatchDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={handleBatchAdd}>
                      确认导入
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button type="button" variant="outline" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" /> 添加题目
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="group relative rounded-2xl border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-5 transition-all hover:border-[var(--shell-muted)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-[var(--shell-muted)]">
                      {questionTypes.find(t => t.value === question.type)?.label}
                    </span>
                  </div>
                  {questions.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>题型</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) =>
                        updateQuestion(question.id, {
                          type: value as QuestionForm["type"],
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择题型" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>分值</Label>
                    <Input
                      type="number"
                      min={0}
                      value={question.points}
                      onChange={(event) =>
                        updateQuestion(question.id, {
                          points: Number(event.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>标准答案</Label>
                    <Input
                      value={question.correctAnswer}
                      onChange={(event) =>
                        updateQuestion(question.id, {
                          correctAnswer: event.target.value,
                        })
                      }
                      placeholder="简答题可留空"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label>题目描述/提示</Label>
                  <Textarea
                    value={question.content}
                    onChange={(event) =>
                      updateQuestion(question.id, {
                        content: event.target.value,
                      })
                    }
                    placeholder="可选填写"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3 mt-10">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                发布中...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" /> 发布考试
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
