"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

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
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [totalScore, setTotalScore] = useState(100);
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    createQuestion(1),
  ]);
  const [loading, setLoading] = useState(false);

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
            <Button type="button" variant="outline" onClick={addQuestion}>
              添加题目
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--shell-muted)]">
                    题目 {index + 1}
                  </p>
                  {questions.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeQuestion(question.id)}
                    >
                      删除
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

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "创建中..." : "发布考试"}
          </Button>
        </div>
      </form>
    </div>
  );
}
