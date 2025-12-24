import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gradeAnswers } from "@/lib/grading";
import { Role } from "@/generated/prisma/client";

const payloadSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerValue: z.string(),
    }),
  ),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { examId } = await params;
  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.examSubmission.findFirst({
    where: {
      examId,
      userId: session.user.id,
      status: "SUBMITTED",
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Already submitted" },
      { status: 409 },
    );
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: true },
  });
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { graded, totalScore } = gradeAnswers(
    exam.questions,
    parsed.data.answers,
  );

  const submission = await prisma.examSubmission.create({
    data: {
      examId: exam.id,
      userId: session.user.id,
      status: "SUBMITTED",
      score: totalScore,
      answers: {
        create: graded.map((answer) => ({
          questionId: answer.questionId,
          answerValue: answer.answerValue,
          isCorrect: answer.isCorrect,
          scoreObtained: answer.scoreObtained,
        })),
      },
    },
  });

  return NextResponse.json({ submission });
}
