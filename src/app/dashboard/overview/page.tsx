import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FilePlus, Users, BarChart3 } from "lucide-react";
import { ScoreDistributionChart } from "@/components/score-distribution-chart";
import { ClassPerformanceChart } from "./class-performance-chart";

export default async function OverviewPage() {
  await requireAdmin();

  const [exams, grades] = await Promise.all([
    prisma.exam.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { submissions: true },
        },
        submissions: {
          where: { score: { not: null } },
          select: { score: true },
        },
      },
    }),
    prisma.grade.findMany({
      include: {
        users: {
          where: { role: "STUDENT" },
          include: {
            exams: {
              where: { score: { not: null } },
              select: { 
                score: true,
                exam: { select: { totalScore: true } }
              },
            }
          }
        }
      }
    })
  ]);

  // Calculate stats
  const totalExams = exams.length;
  const totalSubmissions = exams.reduce(
    (sum, exam) => sum + exam._count.submissions,
    0
  );
  
  let totalGradedCount = 0;
  let totalScoreSum = 0;
  let totalMaxScoreSum = 0;

  const examTrends = exams.map((exam) => {
    const totalScore = exam.totalScore || 100;
    const gradedCount = exam.submissions.length;
    
    totalGradedCount += gradedCount;

    let averageRate = 0;
    if (gradedCount > 0) {
      const examScoreSum = exam.submissions.reduce((acc, sub) => acc + (sub.score || 0), 0);
      averageRate = Math.round((examScoreSum / (gradedCount * totalScore)) * 100);
      
      totalScoreSum += examScoreSum;
      totalMaxScoreSum += gradedCount * totalScore;
    }

    return {
      title: exam.title,
      rate: averageRate,
    };
  });

  // Calculate class performance
  const classPerformance = grades.map((cls) => {
    let classScoreSum = 0;
    let classMaxScoreSum = 0;
    let submissionCount = 0;

    cls.users.forEach(user => {
      user.exams.forEach(sub => {
        classScoreSum += sub.score || 0;
        classMaxScoreSum += sub.exam.totalScore || 100;
        submissionCount++;
      });
    });

    const avgRate = classMaxScoreSum > 0 
      ? Math.round((classScoreSum / classMaxScoreSum) * 100) 
      : 0;

    return {
      name: cls.name,
      rate: avgRate,
      count: submissionCount
    };
  }).filter(c => c.count > 0);

  const overallAverageRate = totalMaxScoreSum > 0 
    ? Math.round((totalScoreSum / totalMaxScoreSum) * 100) 
    : 0;

  const stats = [
    { label: "考试数量", value: totalExams.toString(), icon: FilePlus },
    { label: "提交总数", value: totalSubmissions.toString(), icon: Users },
    { label: "已评分", value: totalGradedCount.toString(), icon: BarChart3 },
    { label: "平均得分率", value: `${overallAverageRate}%`, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>考试趋势分析</CardTitle>
            <CardDescription>
              各次考试平均得分率变化趋势。
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ScoreDistributionChart data={examTrends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>班级表现对比</CardTitle>
            <CardDescription>
              各班级所有考试的平均得分率对比。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassPerformanceChart data={classPerformance} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
