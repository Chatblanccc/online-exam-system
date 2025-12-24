import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

const updatesSchema = z.object({
  updates: z.array(
    z.object({
      answerId: z.string(),
      scoreObtained: z.number().int().min(0),
      teacherComment: z.string().optional(),
    }),
  ),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const existing = await prisma.examSubmission.findUnique({
    where: { id: submissionId },
    });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json();
  const parsed = updatesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (parsed.data.updates.length === 0) {
    return NextResponse.json(
      { error: "No updates provided" },
      { status: 400 },
    );
  }

  const allowedAnswers = await prisma.studentAnswer.findMany({
    where: { submissionId },
    select: { id: true },
  });
  const allowedIds = new Set(allowedAnswers.map((answer) => answer.id));
  const filteredUpdates = parsed.data.updates.filter((update) =>
    allowedIds.has(update.answerId),
  );
  if (filteredUpdates.length === 0) {
    return NextResponse.json({ error: "Invalid updates" }, { status: 400 });
  }

  await prisma.$transaction(
    filteredUpdates.map((update) =>
      prisma.studentAnswer.update({
        where: { id: update.answerId },
        data: {
          scoreObtained: update.scoreObtained,
          teacherComment: update.teacherComment ?? null,
        },
      }),
    ),
  );

  const answers = await prisma.studentAnswer.findMany({
    where: { submissionId },
    select: { scoreObtained: true },
  });

  const totalScore = answers.reduce(
    (sum, answer) => sum + (answer.scoreObtained ?? 0),
    0,
  );

  const submission = await prisma.examSubmission.update({
    where: { id: submissionId },
    data: {
      score: totalScore,
      status: "GRADED",
    },
  });

  return NextResponse.json({ submission });
}
