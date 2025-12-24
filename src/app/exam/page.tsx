import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, CheckCircle2, Clock3 } from "lucide-react";

export default async function ExamListPage() {
  const session = await requireStudent();
  const studentId = session.user.id;

  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submissions: {
        where: {
          userId: studentId,
        },
        select: {
          id: true,
          score: true,
          submittedAt: true,
        },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">考试列表</h1>
        <p className="text-muted-foreground">
          查看并参加当前可用的考试。
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => {
          const submission = exam.submissions[0];
          const isSubmitted = !!submission;
          const isGraded = isSubmitted && submission.score !== null;

          return (
            <Card key={exam.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                   <CardTitle className="text-xl">{exam.title}</CardTitle>
                   {isGraded ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                        {submission.score} 分
                      </Badge>
                   ) : isSubmitted ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
                        批阅中
                      </Badge>
                   ) : (
                      <Badge variant="outline">未开始</Badge>
                   )}
                </div>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4" /> {exam.duration} 分钟
                  <span className="text-muted-foreground/50">•</span>
                  <span className="font-medium">{exam.totalScore} 分</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" /> 
                    <span>标准试卷</span>
                 </div>
              </CardContent>
              <CardFooter>
                {isSubmitted ? (
                   <Button disabled className="w-full">
                      {isGraded ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> 考试已结束
                        </>
                      ) : (
                        <>
                          <Clock3 className="mr-2 h-4 w-4" /> 等待批阅
                        </>
                      )}
                   </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/exam/${exam.id}/take`}>开始答题</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
        {exams.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">暂无考试</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              当前没有发布的考试，请稍后再来查看。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
