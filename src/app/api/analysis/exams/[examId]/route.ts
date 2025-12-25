import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        submissions: {
          where: { score: { not: null } },
          include: {
            user: {
              include: {
                grade: true,
              },
            },
            answers: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const totalSubmissions = exam.submissions.length;
    if (totalSubmissions === 0) {
      return NextResponse.json({
        stats: {
          total: 0,
          average: 0,
          max: 0,
          min: 0,
          passRate: 0,
        },
        scoreDistribution: [],
        classPerformance: [],
        questionAnalysis: [],
      });
    }

    // 1. Calculate Stats
    const scores = exam.submissions.map((s) => s.score || 0);
    const totalScoreSum = scores.reduce((a, b) => a + b, 0);
    const averageScore = Math.round(totalScoreSum / totalSubmissions);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const passThreshold = exam.totalScore * 0.6;
    const passCount = scores.filter((s) => s >= passThreshold).length;
    const passRate = Math.round((passCount / totalSubmissions) * 100);

    // 2. Score Distribution (0-59, 60-69, 70-79, 80-89, 90-100)
    const distribution = [
      { range: "0-59", count: 0 },
      { range: "60-69", count: 0 },
      { range: "70-79", count: 0 },
      { range: "80-89", count: 0 },
      { range: "90-100", count: 0 },
    ];

    scores.forEach((score) => {
      const percentage = (score / exam.totalScore) * 100;
      if (percentage < 60) distribution[0].count++;
      else if (percentage < 70) distribution[1].count++;
      else if (percentage < 80) distribution[2].count++;
      else if (percentage < 90) distribution[3].count++;
      else distribution[4].count++;
    });

    // 3. Class Performance
    const classMap = new Map<string, { sum: number; count: number; name: string }>();
    exam.submissions.forEach((sub) => {
      const gradeName = sub.user.grade?.name || "未分类";
      const gradeId = sub.user.grade?.id || "unknown";
      const current = classMap.get(gradeId) || { sum: 0, count: 0, name: gradeName };
      current.sum += sub.score || 0;
      current.count++;
      classMap.set(gradeId, current);
    });

    const classPerformance = Array.from(classMap.values()).map((c) => ({
      name: c.name,
      average: Math.round(c.sum / c.count),
      rate: Math.round((c.sum / (c.count * exam.totalScore)) * 100),
    }));

    // 4. Question Analysis
    const questionAnalysis = exam.questions.map((q) => {
      let correctCount = 0;
      let totalPointsObtained = 0;

      exam.submissions.forEach((sub) => {
        const answer = sub.answers.find((a) => a.questionId === q.id);
        if (answer) {
          if (answer.isCorrect) correctCount++;
          totalPointsObtained += answer.scoreObtained || 0;
        }
      });

      return {
        id: q.id,
        order: q.order,
        type: q.type,
        points: q.points,
        correctRate: Math.round((correctCount / totalSubmissions) * 100),
        averageScore: Number((totalPointsObtained / totalSubmissions).toFixed(1)),
      };
    });

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        totalScore: exam.totalScore,
      },
      stats: {
        total: totalSubmissions,
        average: averageScore,
        max: maxScore,
        min: minScore,
        passRate,
      },
      scoreDistribution: distribution,
      classPerformance,
      questionAnalysis,
    });
  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

