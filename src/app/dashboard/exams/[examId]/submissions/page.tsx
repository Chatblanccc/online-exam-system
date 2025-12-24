import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import SubmissionGrader from "./submission-grader";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  await requireAdmin();

  const { examId } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      submissions: {
        orderBy: { submittedAt: "desc" },
        include: {
          user: true,
          answers: {
            include: {
              question: true,
            },
          },
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  const payload = {
    id: exam.id,
    title: exam.title,
    submissions: exam.submissions.map((submission) => ({
      id: submission.id,
      status: submission.status,
      score: submission.score,
      submittedAt: submission.submittedAt.toISOString(),
      user: {
        id: submission.user.id,
        name: submission.user.name,
        username: submission.user.username,
      },
      answers: submission.answers.map((answer) => ({
        id: answer.id,
        answerValue: answer.answerValue,
        scoreObtained: answer.scoreObtained,
        teacherComment: answer.teacherComment,
        question: {
          id: answer.question.id,
          order: answer.question.order,
          type: answer.question.type,
          points: answer.question.points,
          content: answer.question.content,
        },
      })),
    })),
  };

  return <SubmissionGrader exam={payload} />;
}
