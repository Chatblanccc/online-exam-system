import path from "path";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { QuestionType, Role } from "@/generated/prisma/client";

const questionSchema = z.object({
  order: z.number().int(),
  type: z.nativeEnum(QuestionType),
  points: z.number().int().min(0),
  content: z.string().optional().nullable(),
  correctAnswer: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      duration: true,
      totalScore: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ exams });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const duration = formData.get("duration");
  const totalScore = formData.get("totalScore");
  const file = formData.get("file");
  const questionsRaw = formData.get("questions");

  if (
    typeof title !== "string" ||
    typeof duration !== "string" ||
    typeof totalScore !== "string" ||
    typeof questionsRaw !== "string" ||
    !(file instanceof File)
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let questionsData: unknown;
  try {
    questionsData = JSON.parse(questionsRaw);
  } catch {
    return NextResponse.json({ error: "Invalid questions" }, { status: 400 });
  }
  const parsedQuestions = z.array(questionSchema).safeParse(questionsData);
  if (!parsedQuestions.success) {
    return NextResponse.json({ error: "Invalid questions" }, { status: 400 });
  }
  if (parsedQuestions.data.length === 0) {
    return NextResponse.json(
      { error: "No questions provided" },
      { status: 400 },
    );
  }

  const durationValue = Number(duration);
  const totalScoreValue = Number(totalScore);
  if (
    !Number.isFinite(durationValue) ||
    !Number.isFinite(totalScoreValue) ||
    durationValue <= 0 ||
    totalScoreValue <= 0
  ) {
    return NextResponse.json({ error: "Invalid numbers" }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase();
  if (![".pdf", ".docx"].includes(extension)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const { relativePath } = await saveUpload(file);

  const exam = await prisma.exam.create({
    data: {
      title,
      duration: durationValue,
      totalScore: totalScoreValue,
      filePath: relativePath,
      questions: {
        create: parsedQuestions.data.map((question) => ({
          order: question.order,
          type: question.type,
          points: question.points,
          content: question.content ?? null,
          correctAnswer: question.correctAnswer ?? null,
        })),
      },
    },
  });

  return NextResponse.json({ exam });
}

