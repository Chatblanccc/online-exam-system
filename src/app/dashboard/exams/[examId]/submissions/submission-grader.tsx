"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AnswerPayload = {
  id: string;
  answerValue: string;
  scoreObtained: number | null;
  teacherComment: string | null;
  question: {
    id: string;
    order: number;
    type: string;
    points: number;
    content: string | null;
  };
};

type SubmissionPayload = {
  id: string;
  status: string;
  score: number | null;
  submittedAt: string;
  user: { id: string; name: string; username: string };
  answers: AnswerPayload[];
};

type ExamPayload = {
  id: string;
  title: string;
  submissions: SubmissionPayload[];
};

type AnswerState = {
  scoreObtained: number;
  teacherComment: string;
};

export default function SubmissionGrader({ exam }: { exam: ExamPayload }) {
  const initialState = useMemo(() => {
    const state: Record<string, AnswerState> = {};
    exam.submissions.forEach((submission) => {
      submission.answers.forEach((answer) => {
        state[answer.id] = {
          scoreObtained: answer.scoreObtained ?? 0,
          teacherComment: answer.teacherComment ?? "",
        };
      });
    });
    return state;
  }, [exam.submissions]);

  const [answerState, setAnswerState] = useState(initialState);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const handleSave = async (submission: SubmissionPayload) => {
    const updates = submission.answers
      .filter((answer) => answer.question.type === "SHORT_ANSWER")
      .map((answer) => ({
        answerId: answer.id,
        scoreObtained: answerState[answer.id]?.scoreObtained ?? 0,
        teacherComment: answerState[answer.id]?.teacherComment ?? "",
      }));

    if (updates.length === 0) {
      toast.info("该提交没有简答题需要评分。");
      return;
    }

    setSaving((prev) => ({ ...prev, [submission.id]: true }));

    const response = await fetch(`/api/submissions/${submission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    setSaving((prev) => ({ ...prev, [submission.id]: false }));

    if (!response.ok) {
      toast.error("保存评分失败，请稍后再试。");
      return;
    }

    toast.success("评分已保存。");
  };

  return (
    <div className="space-y-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
      <div>
        <p className="text-xs uppercase tracking-[0.36em] text-[var(--shell-muted)]">
          {exam.id}
        </p>
        <h2 className="text-3xl font-semibold text-[var(--shell-ink)]">
          <span className="font-[var(--font-fraunces)]">{exam.title}</span>
        </h2>
        <p className="text-sm text-[var(--shell-muted)]">
          批改学生简答题答案并记录评语。
        </p>
      </div>

      {exam.submissions.length === 0 ? (
        <Card className="border border-dashed border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-6 text-center text-sm text-[var(--shell-muted)]">
          暂无学生提交记录。
        </Card>
      ) : null}

      {exam.submissions.map((submission) => {
        const shortAnswers = submission.answers.filter(
          (answer) => answer.question.type === "SHORT_ANSWER",
        );

        return (
          <Card
            key={submission.id}
            className="border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.35)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-[var(--shell-ink)]">
                  {submission.user.name}
                </h3>
                <p className="text-sm text-[var(--shell-muted)]">
                  {submission.user.username} · 提交时间{" "}
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[var(--shell-border)]">
                  {submission.status}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-[var(--shell-accent-soft)] text-[var(--shell-ink)]"
                >
                  当前得分 {submission.score ?? 0}
                </Badge>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {shortAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className="rounded-2xl border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--shell-muted)]">
                      简答题 {answer.question.order}
                    </p>
                    <span className="text-xs text-[var(--shell-muted)]">
                      满分 {answer.question.points}
                    </span>
                  </div>
                  {answer.question.content ? (
                    <p className="mt-2 text-sm text-[var(--shell-muted)]">
                      {answer.question.content}
                    </p>
                  ) : null}
                  <div className="mt-3 rounded-xl border border-dashed border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)]">
                    {answer.answerValue || "未作答"}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr]">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                        得分
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={answer.question.points}
                        value={answerState[answer.id]?.scoreObtained ?? 0}
                        onChange={(event) =>
                          setAnswerState((prev) => ({
                            ...prev,
                            [answer.id]: {
                              ...prev[answer.id],
                              scoreObtained: Number(event.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                        教师评语
                      </label>
                      <Textarea
                        rows={2}
                        value={answerState[answer.id]?.teacherComment ?? ""}
                        onChange={(event) =>
                          setAnswerState((prev) => ({
                            ...prev,
                            [answer.id]: {
                              ...prev[answer.id],
                              teacherComment: event.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              {shortAnswers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3 text-sm text-[var(--shell-muted)]">
                  没有需要手动评分的题目。
                </div>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                onClick={() => handleSave(submission)}
                disabled={saving[submission.id]}
              >
                {saving[submission.id] ? "保存中..." : "保存评分"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
