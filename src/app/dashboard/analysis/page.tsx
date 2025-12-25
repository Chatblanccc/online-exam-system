import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { AnalysisClient } from "./analysis-client";

export default async function AnalysisPage() {
  await requireAdmin();

  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">数据分析</h1>
        <p className="text-muted-foreground">
          选择一场考试以查看详细的统计数据和表现分析。
        </p>
      </div>

      <AnalysisClient initialExams={exams} />
    </div>
  );
}

