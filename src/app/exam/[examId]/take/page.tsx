import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import ExamTakeClient from "./exam-take-client";

export default async function ExamTakePage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  await requireStudent();

  const { examId } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  return <ExamTakeClient exam={exam} />;
}
